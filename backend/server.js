// backend/server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Silence non-essential logs by default to keep backend output clean
// Set VERBOSE_LOGS=true to re-enable console.log output
if (process.env.VERBOSE_LOGS !== 'true') {
  // Keep warnings and errors; silence info logs
  // eslint-disable-next-line no-console
  console.log = function noop() {};
}

// Robust CORS for production and previews
const explicitAllowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5175'
].filter(Boolean);

const allowedOriginPatterns = [
  /\.vercel\.app$/i,          // allow Vercel preview & prod subdomains
  /\.onrender\.com$/i         // allow our own Render domain
];

const corsOptions = {
  origin: (origin, callback) => {
    // No origin (e.g. curl, server-to-server) -> allow
    if (!origin) return callback(null, true);
    if (explicitAllowedOrigins.includes(origin)) return callback(null, true);
    if (allowedOriginPatterns.some((re) => re.test(origin))) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type, Authorization'
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Print a single DB connection status line at startup
const printStartup = (message) => {
  try { process.stdout.write(message + '\n'); } catch (_) {}
};

(async () => {
  try {
    await pool.query('SELECT 1');
    printStartup('✅ Connected to NeonDB');
  } catch (err) {
    console.error('❌ Database connection failed:', err?.message || err);
  }
})();

// JWT middleware (define early so it can be used in routes)
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, phone, role, profile_completed FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Debug route removed for clean output

// Get pending admin approvals with NFT details
app.get('/api/admin/approvals/pending', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        aa.*,
        n.name as nft_name,
        n.description as nft_description,
        n.image_url as nft_image_url,
        n.token_id as nft_token_id,
        n.owner_id as nft_owner,
        n.price_wei as nft_price_wei,
        u.email as user_email,
        u.first_name as user_first_name,
        u.last_name as user_last_name
      FROM admin_approvals aa
      LEFT JOIN nfts n ON (aa.request_data->>'nft_id')::uuid = n.id
      LEFT JOIN users u ON aa.user_id = u.id
      WHERE aa.status = 'pending' 
      ORDER BY aa.created_at DESC`
    );
    res.json({ approvals: result.rows });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's own approvals
app.get('/api/admin/approvals/my-approvals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT * FROM admin_approvals WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ approvals: result.rows });
  } catch (error) {
    console.error('Error fetching user approvals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin approve request
app.post('/api/admin/approvals/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;
    const adminId = req.user.id;

    // Check if user is admin
    const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [adminId]);
    if (!userCheck.rows[0] || userCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    // Update approval status
    const result = await pool.query(
      `UPDATE admin_approvals 
       SET status = 'approved', 
           admin_notes = $1, 
           approved_by = $2, 
           approved_at = NOW(),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [admin_notes || 'Approved by admin', adminId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Approval request not found' });
    }

    // If it's an NFT minting approval, update the NFT status
    const approval = result.rows[0];
    const nftId = approval.request_data?.nft_id;
    if (approval.approval_type === 'nft_mint' && nftId) {
      await pool.query(
        `UPDATE nfts SET is_approved = true WHERE id = $1`,
        [nftId]
      );
    }

    res.json({ success: true, approval: approval });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin reject request
app.post('/api/admin/approvals/:id/reject', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;
    const adminId = req.user.id;

    // Check if user is admin
    const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [adminId]);
    if (!userCheck.rows[0] || userCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    // Update approval status
    const result = await pool.query(
      `UPDATE admin_approvals 
       SET status = 'rejected', 
           admin_notes = $1, 
           approved_by = $2, 
           approved_at = NOW(),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [admin_notes || 'Rejected by admin', adminId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Approval request not found' });
    }

    res.json({ success: true, approval: result.rows[0] });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get all users
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    const adminId = req.user.id;
    
    // Check if user is admin
    const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [adminId]);
    if (!userCheck.rows[0] || userCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const result = await pool.query(
      `SELECT id, email, first_name, last_name, role, is_verified, created_at, last_login 
       FROM users 
       ORDER BY created_at DESC`
    );
    
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get user by ID
app.get('/api/admin/users/:id', authenticateToken, async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;
    
    // Check if user is admin
    const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [adminId]);
    if (!userCheck.rows[0] || userCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const result = await pool.query(
      `SELECT id, email, first_name, last_name, role, is_verified, created_at, last_login 
       FROM users 
       WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test database connection
// Keep error reporting for pool errors
pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Initialize database schema
const initializeDatabase = async () => {
  try {
    console.log('🔧 Initializing database schema...');
    
    // First, clean up unwanted tables created by the SQL file
    console.log('🧹 Cleaning up unwanted tables...');
    const unwantedTables = [
      'dao_analytics',
      'dao_notifications', 
      'dao_treasury',
      'dao_user_profiles',
      'dao_voting_sessions',
      'dao_treasury_transactions',
      'dao_governance_tokens',
      'dao_delegations',
      'nft_lands' // Remove redundant NFT table
    ];
    
    for (const table of unwantedTables) {
      try {
        await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`✅ Dropped unwanted table: ${table}`);
      } catch (error) {
        console.log(`⚠️ Could not drop table ${table}:`, error.message);
      }
    }
    
    // Add missing columns to wallet_accounts table
    const schemaFixes = [
      `DO $$ 
       BEGIN
           IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'wallet_accounts' AND column_name = 'chain_id') THEN
               ALTER TABLE wallet_accounts ADD COLUMN chain_id VARCHAR(20) DEFAULT 'amoy';
           END IF;
       END $$;`,
      
      `DO $$ 
       BEGIN
           IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'wallet_accounts' AND column_name = 'token_symbol') THEN
               ALTER TABLE wallet_accounts ADD COLUMN token_symbol VARCHAR(10) DEFAULT 'KRSI';
           END IF;
       END $$;`,
      
      `DO $$ 
       BEGIN
           IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'wallet_accounts' AND column_name = 'custodial') THEN
               ALTER TABLE wallet_accounts ADD COLUMN custodial BOOLEAN DEFAULT true;
           END IF;
       END $$;`,
      
      `DO $$ 
       BEGIN
           IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'wallet_accounts' AND column_name = 'created_at') THEN
               ALTER TABLE wallet_accounts ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
           END IF;
       END $$;`,
      
      `DO $$ 
       BEGIN
           IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'wallet_accounts' AND column_name = 'updated_at') THEN
               ALTER TABLE wallet_accounts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
           END IF;
       END $$;`,
      
      `DO $$ 
       BEGIN
           IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'wallet_accounts' AND column_name = 'metadata') THEN
               ALTER TABLE wallet_accounts ADD COLUMN metadata JSONB DEFAULT '{}';
           END IF;
       END $$;`
    ];

    for (const fix of schemaFixes) {
      await pool.query(fix);
    }

    // Create indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_wallet_accounts_user_id ON wallet_accounts(user_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_wallet_accounts_address ON wallet_accounts(address);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_wallet_accounts_wallet_type ON wallet_accounts(wallet_type);');

    // Create function and trigger for updated_at
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

            await pool.query('DROP TRIGGER IF EXISTS update_wallet_accounts_updated_at ON wallet_accounts;');
            await pool.query(`
              CREATE TRIGGER update_wallet_accounts_updated_at 
                  BEFORE UPDATE ON wallet_accounts 
                  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            `);

            // Create NFTs table if it doesn't exist
            await pool.query(`
              CREATE TABLE IF NOT EXISTS nfts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                description TEXT,
                image_url VARCHAR(255),
                price_wei BIGINT NOT NULL DEFAULT 0,
                owner_id UUID REFERENCES users(id),
                token_id VARCHAR(255),
                contract_address VARCHAR(255),
                is_listed BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );
            `);

            // Add indexes for NFTs
            await pool.query('CREATE INDEX IF NOT EXISTS idx_nfts_owner_id ON nfts(owner_id);');
            await pool.query('CREATE INDEX IF NOT EXISTS idx_nfts_is_listed ON nfts(is_listed);');

            // Create function and trigger for updated_at on nfts table
            await pool.query(`
              CREATE OR REPLACE FUNCTION update_nfts_updated_at_column()
              RETURNS TRIGGER AS $$
              BEGIN
                  NEW.updated_at = NOW();
                  RETURN NEW;
              END;
              $$ language 'plpgsql';
            `);

            await pool.query('DROP TRIGGER IF EXISTS update_nfts_updated_at ON nfts;');
            await pool.query(`
              CREATE TRIGGER update_nfts_updated_at 
                  BEFORE UPDATE ON nfts 
                  FOR EACH ROW EXECUTE FUNCTION update_nfts_updated_at_column();
            `);

            // Create Admin Approvals table if it doesn't exist
            await pool.query(`
              CREATE TABLE IF NOT EXISTS admin_approvals (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id),
                approval_type VARCHAR(100) NOT NULL,
                status VARCHAR(32) NOT NULL DEFAULT 'pending',
                request_data JSONB,
                admin_notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );
            `);

            await pool.query('CREATE INDEX IF NOT EXISTS idx_admin_approvals_status ON admin_approvals(status);');
            await pool.query('CREATE INDEX IF NOT EXISTS idx_admin_approvals_type ON admin_approvals(approval_type);');

            await pool.query(`
              CREATE OR REPLACE FUNCTION update_admin_approvals_updated_at_column()
              RETURNS TRIGGER AS $$
              BEGIN
                  NEW.updated_at = NOW();
                  RETURN NEW;
              END;
              $$ language 'plpgsql';
            `);

            await pool.query('DROP TRIGGER IF EXISTS update_admin_approvals_updated_at ON admin_approvals;');
            await pool.query(`
              CREATE TRIGGER update_admin_approvals_updated_at 
                  BEFORE UPDATE ON admin_approvals 
                  FOR EACH ROW EXECUTE FUNCTION update_admin_approvals_updated_at_column();
            `);

            // Create DAO tables
            await pool.query(`
              CREATE TABLE IF NOT EXISTS dao_proposals (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                proposal_id BIGINT NOT NULL UNIQUE,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                detailed_proposal TEXT,
                proposer_address VARCHAR(42) NOT NULL,
                proposer_user_id UUID REFERENCES users(id),
                proposal_type VARCHAR(50) NOT NULL CHECK (proposal_type IN (
                  'PLATFORM_POLICY', 'CROP_PRICING', 'LOAN_TERMS', 'FARMER_VERIFICATION',
                  'SUSTAINABILITY', 'TECHNOLOGY_UPGRADE', 'EMERGENCY_RESPONSE',
                  'TREASURY_MANAGEMENT', 'PARTNERSHIP', 'RESEARCH_FUNDING'
                )),
                status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
                  'DRAFT', 'ACTIVE', 'PASSED', 'REJECTED', 'EXECUTED', 'EXPIRED'
                )),
                votes_for BIGINT DEFAULT 0,
                votes_against BIGINT DEFAULT 0,
                abstain_votes BIGINT DEFAULT 0,
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP NOT NULL,
                execution_time TIMESTAMP,
                quorum_required INTEGER NOT NULL,
                threshold_required INTEGER NOT NULL,
                executed BOOLEAN DEFAULT FALSE,
                tags TEXT[],
                related_proposals BIGINT[],
                blockchain_tx_hash VARCHAR(66),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
              )
            `);

            await pool.query(`
              CREATE TABLE IF NOT EXISTS dao_votes (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                proposal_id BIGINT NOT NULL REFERENCES dao_proposals(proposal_id),
                voter_address VARCHAR(42) NOT NULL,
                voter_user_id UUID REFERENCES users(id),
                vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('FOR', 'AGAINST', 'ABSTAIN')),
                voting_power BIGINT NOT NULL,
                voter_role VARCHAR(20) NOT NULL CHECK (voter_role IN (
                  'FARMER', 'INVESTOR', 'RESEARCHER', 'ADVISOR', 'GOVERNMENT', 'NGO', 'CONSUMER'
                )),
                reason TEXT,
                blockchain_tx_hash VARCHAR(66),
                created_at TIMESTAMP DEFAULT NOW()
              )
            `);

        // Removed dao_user_profiles table - using existing user data instead

            await pool.query(`
              CREATE TABLE IF NOT EXISTS agricultural_metrics (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                total_farmers INTEGER DEFAULT 0,
                total_land_area DECIMAL(15,2) DEFAULT 0,
                total_crop_value BIGINT DEFAULT 0,
                average_yield DECIMAL(10,2) DEFAULT 0,
                sustainability_score INTEGER DEFAULT 0,
                technology_adoption DECIMAL(5,2) DEFAULT 0,
                organic_farming_percentage DECIMAL(5,2) DEFAULT 0,
                water_usage_efficiency DECIMAL(5,2) DEFAULT 0,
                carbon_footprint_reduction DECIMAL(5,2) DEFAULT 0,
                last_updated TIMESTAMP DEFAULT NOW(),
                created_at TIMESTAMP DEFAULT NOW()
              )
            `);

            // Add indexes for DAO tables
            await pool.query('CREATE INDEX IF NOT EXISTS idx_dao_proposals_type ON dao_proposals(proposal_type);');
            await pool.query('CREATE INDEX IF NOT EXISTS idx_dao_proposals_status ON dao_proposals(status);');
            await pool.query('CREATE INDEX IF NOT EXISTS idx_dao_proposals_proposer ON dao_proposals(proposer_user_id);');
            await pool.query('CREATE INDEX IF NOT EXISTS idx_dao_votes_proposal ON dao_votes(proposal_id);');
            await pool.query('CREATE INDEX IF NOT EXISTS idx_dao_votes_voter ON dao_votes(voter_user_id);');
            // Removed dao_user_profiles index - table no longer exists

            // Create farmer_profiles table
            await pool.query(`
              CREATE TABLE IF NOT EXISTS farmer_profiles (
                id SERIAL PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                land_area_acres DECIMAL(10,2) DEFAULT 0,
                total_loans INTEGER DEFAULT 0,
                active_loans INTEGER DEFAULT 0,
                completed_loans INTEGER DEFAULT 0,
                total_batches INTEGER DEFAULT 0,
                verified_batches INTEGER DEFAULT 0,
                land_nfts INTEGER DEFAULT 0,
                farming_experience_years INTEGER DEFAULT 0,
                primary_crops TEXT[],
                farming_method VARCHAR(50),
                irrigation_type VARCHAR(50),
                soil_type VARCHAR(50),
                region VARCHAR(100),
                village VARCHAR(100),
                state VARCHAR(100),
                country VARCHAR(100) DEFAULT 'India',
                phone_number VARCHAR(20),
                emergency_contact VARCHAR(20),
                bank_account_number VARCHAR(50),
                ifsc_code VARCHAR(20),
                aadhaar_number VARCHAR(20),
                pan_number VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id)
              )
            `);

            // Create farmer_loans table
            await pool.query(`
              CREATE TABLE IF NOT EXISTS farmer_loans (
                id SERIAL PRIMARY KEY,
                farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                loan_amount DECIMAL(15,2) NOT NULL,
                interest_rate DECIMAL(5,2) NOT NULL,
                loan_duration_months INTEGER NOT NULL,
                purpose TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                approval_date TIMESTAMP,
                disbursement_date TIMESTAMP,
                repayment_date TIMESTAMP,
                collateral_description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              )
            `);

            // Create farmer_batches table
            await pool.query(`
              CREATE TABLE IF NOT EXISTS farmer_batches (
                id SERIAL PRIMARY KEY,
                farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                crop_type VARCHAR(50) NOT NULL,
                variety VARCHAR(100),
                quantity_kg DECIMAL(10,2) NOT NULL,
                harvest_date DATE NOT NULL,
                quality_grade VARCHAR(20),
                certification_status VARCHAR(20) DEFAULT 'pending',
                batch_number VARCHAR(50) UNIQUE,
                storage_location VARCHAR(100),
                price_per_kg DECIMAL(10,2),
                total_value DECIMAL(15,2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              )
            `);

            // Add indexes for farmer tables
            await pool.query('CREATE INDEX IF NOT EXISTS idx_farmer_profiles_user ON farmer_profiles(user_id);');
            await pool.query('CREATE INDEX IF NOT EXISTS idx_farmer_loans_farmer ON farmer_loans(farmer_id);');
            await pool.query('CREATE INDEX IF NOT EXISTS idx_farmer_loans_status ON farmer_loans(status);');
            await pool.query('CREATE INDEX IF NOT EXISTS idx_farmer_batches_farmer ON farmer_batches(farmer_id);');
            await pool.query('CREATE INDEX IF NOT EXISTS idx_farmer_batches_crop ON farmer_batches(crop_type);');

            // Insert sample agricultural metrics
            await pool.query(`
              INSERT INTO agricultural_metrics (
                total_farmers, total_land_area, total_crop_value, average_yield,
                sustainability_score, technology_adoption, organic_farming_percentage,
                water_usage_efficiency, carbon_footprint_reduction
              ) VALUES (
                1250, 15750.50, 5000000000, 2.5, 85, 72.5, 35.2, 78.3, 42.1
              ) ON CONFLICT DO NOTHING
            `);

            // Seed sample NFTs if none exist
            const nftCount = await pool.query('SELECT COUNT(*) as count FROM nfts');
            if (nftCount.rows[0].count === '0') {
              console.log('🌱 Seeding sample NFTs...');
              
              const sampleNFTs = [
                {
                  name: 'Premium Rice Farm - Punjab',
                  description: 'High-yield rice farm with modern irrigation system and certified organic practices',
                  image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&h=300&fit=crop',
                  price_wei: '1000000', // 1 KRSI with 6 decimals
                  token_id: 'LAND001',
                  land_area: 25.5,
                  location: 'Punjab, India',
                  soil_type: 'Alluvial',
                  crop_history: 'Rice, Wheat, Mustard'
                },
                {
                  name: 'Organic Vegetable Farm - Maharashtra',
                  description: 'Certified organic farm specializing in premium vegetables with sustainable farming practices',
                  image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&h=300&fit=crop',
                  price_wei: '750000', // 0.75 KRSI with 6 decimals
                  token_id: 'LAND002',
                  land_area: 15.2,
                  location: 'Maharashtra, India',
                  soil_type: 'Black Cotton',
                  crop_history: 'Tomatoes, Onions, Chilies'
                },
                {
                  name: 'Wheat Farm - Haryana',
                  description: 'Large-scale wheat production farm with advanced agricultural technology',
                  image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=300&fit=crop',
                  price_wei: '2000000', // 2 KRSI with 6 decimals
                  token_id: 'LAND003',
                  land_area: 50.0,
                  location: 'Haryana, India',
                  soil_type: 'Sandy Loam',
                  crop_history: 'Wheat, Barley, Mustard'
                },
                {
                  name: 'Sugarcane Plantation - Uttar Pradesh',
                  description: 'Modern sugarcane plantation with integrated processing facility',
                  image_url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ce?w=500&h=300&fit=crop',
                  price_wei: '3000000', // 3 KRSI with 6 decimals
                  token_id: 'LAND004',
                  land_area: 75.8,
                  location: 'Uttar Pradesh, India',
                  soil_type: 'Clay Loam',
                  crop_history: 'Sugarcane, Rice'
                },
                {
                  name: 'Spice Garden - Kerala',
                  description: 'Traditional spice garden with multiple exotic crops and heritage farming methods',
                  image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop',
                  price_wei: '1500000', // 1.5 KRSI with 6 decimals
                  token_id: 'LAND005',
                  land_area: 12.3,
                  location: 'Kerala, India',
                  soil_type: 'Laterite',
                  crop_history: 'Pepper, Cardamom, Ginger'
                },
                {
                  name: 'Cotton Farm - Gujarat',
                  description: 'Premium cotton farm with modern irrigation and pest management systems',
                  image_url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500&h=300&fit=crop',
                  price_wei: '1800000', // 1.8 KRSI with 6 decimals
                  token_id: 'LAND006',
                  land_area: 35.7,
                  location: 'Gujarat, India',
                  soil_type: 'Alluvial',
                  crop_history: 'Cotton, Groundnut, Wheat'
                },
                {
                  name: 'Tea Plantation - Assam',
                  description: 'High-altitude tea plantation producing premium quality tea leaves',
                  image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop',
                  price_wei: '2500000', // 2.5 KRSI with 6 decimals
                  token_id: 'LAND007',
                  land_area: 42.1,
                  location: 'Assam, India',
                  soil_type: 'Acidic',
                  crop_history: 'Tea, Rubber'
                },
                {
                  name: 'Dairy Farm - Rajasthan',
                  description: 'Integrated dairy farm with modern milking facilities and organic feed production',
                  image_url: 'https://images.unsplash.com/photo-1548550023-344f2d6a2b7e?w=500&h=300&fit=crop',
                  price_wei: '1200000', // 1.2 KRSI with 6 decimals
                  token_id: 'LAND008',
                  land_area: 28.9,
                  location: 'Rajasthan, India',
                  soil_type: 'Desert',
                  crop_history: 'Fodder, Barley, Mustard'
                }
              ];
              
              for (const nft of sampleNFTs) {
                await pool.query(
                  `INSERT INTO nfts (name, description, image_url, price_wei, token_id, land_area, location, soil_type, crop_history, is_listed, is_verified) 
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                  [nft.name, nft.description, nft.image_url, nft.price_wei, nft.token_id, nft.land_area, nft.location, nft.soil_type, nft.crop_history, true, true]
                );
              }
              
              console.log('✅ Sample NFTs seeded successfully!');
            } else {
              console.log('📋 NFTs already exist in database');
            }

            // Seed sample DAO proposals and votes
            try {
              const proposalCount = await pool.query('SELECT COUNT(*) as count FROM dao_proposals');
              console.log('🔍 Current DAO proposals count:', proposalCount.rows[0].count);
              
              if (proposalCount.rows[0].count === '0') {
                console.log('🗳️ Seeding sample DAO proposals...');
                
                // Insert sample DAO proposals
                const proposalResult = await pool.query(`
                  INSERT INTO dao_proposals (
                    proposal_id, title, description, detailed_proposal, proposer_address,
                    proposer_user_id, proposal_type, status, votes_for, votes_against,
                    abstain_votes, start_time, end_time, quorum_required, threshold_required,
                    executed, tags
                  ) VALUES
                  (
                    1, 'Increase KRSI Staking Rewards', 'Propose to increase the annual percentage yield (APY) for KRSI token staking to incentivize more participation.',
                    'This proposal aims to boost the KRSI staking rewards from 5% to 7% APY. The increase will be funded from the DAO treasury and is expected to attract more long-term holders, enhancing network security and decentralization.',
                    '0x5F3C518A32d307A9372523e93d02A56e4F229AC6', (SELECT id FROM users LIMIT 1), 'TREASURY_MANAGEMENT', 'ACTIVE', 1500000, 500000, 100000,
                    NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days', 50, 60, FALSE, ARRAY['staking', 'rewards', 'treasury']
                  ),
                  (
                    2, 'Fund Sustainable Farming Research', 'Allocate funds for research into new sustainable farming techniques for arid regions.',
                    'This proposal seeks to allocate 500,000 KRSI from the DAO treasury to fund a 12-month research project focused on developing drought-resistant crops and water-efficient irrigation systems.',
                    '0x5F3C518A32d307A9372523e93d02A56e4F229AC6', (SELECT id FROM users LIMIT 1), 'RESEARCH_FUNDING', 'ACTIVE', 1200000, 300000, 50000,
                    NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', 40, 55, FALSE, ARRAY['sustainability', 'research', 'innovation']
                  ),
                  (
                    3, 'Community Grant Program for Small Farmers', 'Establish a grant program to support small-scale farmers in adopting new technologies.',
                    'This proposal outlines the creation of a 1,000,000 KRSI grant program to provide financial assistance to small-scale farmers for purchasing modern agricultural equipment.',
                    '0x5F3C518A32d307A9372523e93d02A56e4F229AC6', (SELECT id FROM users LIMIT 1), 'FARMER_VERIFICATION', 'PASSED', 2000000, 100000, 20000,
                    NOW() - INTERVAL '10 days', NOW() - INTERVAL '3 days', 60, 70, TRUE, ARRAY['grants', 'community', 'small farmers']
                  ),
                  (
                    4, 'Implement Carbon Credit Trading', 'Create a carbon credit trading system for sustainable farming practices.',
                    'This proposal introduces a carbon credit trading mechanism where farmers can earn credits for sustainable practices and trade them on the platform.',
                    '0x5F3C518A32d307A9372523e93d02A56e4F229AC6', (SELECT id FROM users LIMIT 1), 'SUSTAINABILITY', 'ACTIVE', 800000, 200000, 50000,
                    NOW() - INTERVAL '3 days', NOW() + INTERVAL '4 days', 45, 55, FALSE, ARRAY['carbon', 'sustainability', 'trading']
                  ),
                  (
                    5, 'Upgrade Platform Technology Stack', 'Modernize the platform infrastructure for better performance and security.',
                    'This proposal allocates funds to upgrade the platform\'s technology stack, improve security measures, and enhance user experience.',
                    '0x5F3C518A32d307A9372523e93d02A56e4F229AC6', (SELECT id FROM users LIMIT 1), 'TECHNOLOGY_UPGRADE', 'DRAFT', 0, 0, 0,
                    NOW() + INTERVAL '1 day', NOW() + INTERVAL '7 days', 30, 50, FALSE, ARRAY['technology', 'upgrade', 'infrastructure']
                  )
                  ON CONFLICT (proposal_id) DO NOTHING
                `);
                console.log('✅ DAO proposals inserted:', proposalResult.rowCount);

                // Insert sample DAO votes
                const voteResult = await pool.query(`
                  INSERT INTO dao_votes (
                    proposal_id, voter_address, voter_user_id, vote_type, voting_power, voter_role, reason
                  ) VALUES
                  (
                    1, '0x5F3C518A32d307A9372523e93d02A56e4F229AC6', (SELECT id FROM users LIMIT 1), 'FOR', 100000, 'FARMER', 'Supports increased incentives for staking.'
                  ),
                  (
                    1, '0x1234567890123456789012345678901234567890', (SELECT id FROM users LIMIT 1), 'AGAINST', 50000, 'INVESTOR', 'Concerned about treasury depletion.'
                  ),
                  (
                    2, '0x5F3C518A32d307A9372523e93d02A56e4F229AC6', (SELECT id FROM users LIMIT 1), 'FOR', 75000, 'RESEARCHER', 'Crucial for agricultural innovation.'
                  ),
                  (
                    3, '0x5F3C518A32d307A9372523e93d02A56e4F229AC6', (SELECT id FROM users LIMIT 1), 'FOR', 120000, 'NGO', 'Directly benefits vulnerable farming communities.'
                  ),
                  (
                    4, '0x5F3C518A32d307A9372523e93d02A56e4F229AC6', (SELECT id FROM users LIMIT 1), 'FOR', 90000, 'FARMER', 'Great opportunity for additional income.'
                  ),
                  (
                    4, '0x1234567890123456789012345678901234567890', (SELECT id FROM users LIMIT 1), 'AGAINST', 30000, 'INVESTOR', 'Complex implementation concerns.'
                  )
                  ON CONFLICT DO NOTHING
                `);
                console.log('✅ DAO votes inserted:', voteResult.rowCount);

                console.log('✅ Sample DAO proposals and votes seeded successfully!');
              } else {
                console.log('🗳️ DAO proposals already exist in database');
              }
            } catch (daoError) {
              console.error('❌ Error seeding DAO data:', daoError);
            }

            console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Database schema initialization error:', error);
  }
};

// Initialize database schema on startup
initializeDatabase();

// Ensure wallet table schema function
const ensureWalletTableSchema = async () => {
  try {
    // Add missing columns to wallet_accounts table
    const schemaFixes = [
      `DO $$ 
       BEGIN
           IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'wallet_accounts' AND column_name = 'chain_id') THEN
               ALTER TABLE wallet_accounts ADD COLUMN chain_id VARCHAR(20) DEFAULT 'amoy';
           END IF;
       END $$;`,
      
      `DO $$ 
       BEGIN
           IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'wallet_accounts' AND column_name = 'token_symbol') THEN
               ALTER TABLE wallet_accounts ADD COLUMN token_symbol VARCHAR(10) DEFAULT 'KRSI';
           END IF;
       END $$;`,
      
      `DO $$ 
       BEGIN
           IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'wallet_accounts' AND column_name = 'custodial') THEN
               ALTER TABLE wallet_accounts ADD COLUMN custodial BOOLEAN DEFAULT true;
           END IF;
       END $$;`,
      
      `DO $$ 
       BEGIN
           IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'wallet_accounts' AND column_name = 'created_at') THEN
               ALTER TABLE wallet_accounts ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
           END IF;
       END $$;`,
      
      `DO $$ 
       BEGIN
           IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'wallet_accounts' AND column_name = 'updated_at') THEN
               ALTER TABLE wallet_accounts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
           END IF;
       END $$;`,
      
      `DO $$ 
       BEGIN
           IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'wallet_accounts' AND column_name = 'metadata') THEN
               ALTER TABLE wallet_accounts ADD COLUMN metadata JSONB DEFAULT '{}';
           END IF;
       END $$;`
    ];

    for (const fix of schemaFixes) {
      await pool.query(fix);
    }
  } catch (error) {
    console.error('Schema ensure error:', error);
  }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'NeonDB API is running' });
});

// Debug endpoint to check table structure
app.get('/api/debug/table-structure', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'wallet_accounts' 
      ORDER BY ordinal_position
    `);
    res.json({ columns: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sign up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, role } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, profile_completed)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, first_name, last_name, phone, role, profile_completed`,
      [email.toLowerCase(), passwordHash, first_name || '', last_name || '', phone || '', role || 'farmer', false]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role,
        profile_completed: user.profile_completed
      },
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign in
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user from database
    const result = await pool.query(
      'SELECT id, email, password_hash, first_name, last_name, phone, role, profile_completed FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Sign in successful',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role,
        profile_completed: user.profile_completed
      },
      token
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    user: req.user
  });
});

// Update profile
app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { first_name, last_name, phone, role } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, phone = $3, role = $4, profile_completed = true, updated_at = NOW()
       WHERE id = $5
       RETURNING id, email, first_name, last_name, phone, role, profile_completed`,
      [first_name, last_name, phone, role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get profile
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({
    user: req.user
  });
});

// Sign out (client-side token removal)
app.post('/api/auth/signout', (req, res) => {
  res.json({ message: 'Signed out successfully' });
});

// Debug endpoint to check users
app.get('/api/debug/check-users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email FROM users LIMIT 5');
    res.json({
      success: true,
      users: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to check nft_lands table
app.get('/api/debug/check-nft-lands', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM nft_lands');
    res.json({
      success: true,
      count: result.rows[0].count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to manually seed DAO data
app.post('/api/debug/seed-dao', async (req, res) => {
  try {
    console.log('🗳️ Manual DAO seeding requested...');
    
    // Check if users exist
    const userCheck = await pool.query('SELECT id FROM users LIMIT 1');
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ error: 'No users found. Please create a user first.' });
    }
    
    const userId = userCheck.rows[0].id;
    console.log('👤 Using user ID for seeding:', userId);
    
    // Clear existing data
    await pool.query('DELETE FROM dao_votes');
    await pool.query('DELETE FROM dao_proposals');
    
    // Insert sample DAO proposals
    const proposalResult = await pool.query(`
      INSERT INTO dao_proposals (
        proposal_id, title, description, detailed_proposal, proposer_address,
        proposer_user_id, proposal_type, status, votes_for, votes_against,
        abstain_votes, start_time, end_time, quorum_required, threshold_required,
        executed, tags
      ) VALUES
      (
        1, 'Increase KRSI Staking Rewards', 'Propose to increase the annual percentage yield (APY) for KRSI token staking to incentivize more participation.',
        'This proposal aims to boost the KRSI staking rewards from 5% to 7% APY. The increase will be funded from the DAO treasury and is expected to attract more long-term holders, enhancing network security and decentralization.',
        '0x5F3C518A32d307A9372523e93d02A56e4F229AC6', $1, 'TREASURY_MANAGEMENT', 'ACTIVE', 1500000, 500000, 100000,
        NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days', 50, 60, FALSE, ARRAY['staking', 'rewards', 'treasury']
      ),
      (
        2, 'Fund Sustainable Farming Research', 'Allocate funds for research into new sustainable farming techniques for arid regions.',
        'This proposal seeks to allocate 500,000 KRSI from the DAO treasury to fund a 12-month research project focused on developing drought-resistant crops and water-efficient irrigation systems.',
        '0x5F3C518A32d307A9372523e93d02A56e4F229AC6', $1, 'RESEARCH_FUNDING', 'ACTIVE', 1200000, 300000, 50000,
        NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', 40, 55, FALSE, ARRAY['sustainability', 'research', 'innovation']
      ),
      (
        3, 'Community Grant Program for Small Farmers', 'Establish a grant program to support small-scale farmers in adopting new technologies.',
        'This proposal outlines the creation of a 1,000,000 KRSI grant program to provide financial assistance to small-scale farmers for purchasing modern agricultural equipment.',
        '0x5F3C518A32d307A9372523e93d02A56e4F229AC6', $1, 'FARMER_VERIFICATION', 'PASSED', 2000000, 100000, 20000,
        NOW() - INTERVAL '10 days', NOW() - INTERVAL '3 days', 60, 70, TRUE, ARRAY['grants', 'community', 'small farmers']
      ),
      (
        4, 'Implement Carbon Credit Trading', 'Create a carbon credit trading system for sustainable farming practices.',
        'This proposal introduces a carbon credit trading mechanism where farmers can earn credits for sustainable practices and trade them on the platform.',
        '0x5F3C518A32d307A9372523e93d02A56e4F229AC6', $1, 'SUSTAINABILITY', 'ACTIVE', 800000, 200000, 50000,
        NOW() - INTERVAL '3 days', NOW() + INTERVAL '4 days', 45, 55, FALSE, ARRAY['carbon', 'sustainability', 'trading']
      ),
      (
        5, 'Upgrade Platform Technology Stack', 'Modernize the platform infrastructure for better performance and security.',
        'This proposal allocates funds to upgrade the platform\'s technology stack, improve security measures, and enhance user experience.',
        '0x5F3C518A32d307A9372523e93d02A56e4F229AC6', $1, 'TECHNOLOGY_UPGRADE', 'DRAFT', 0, 0, 0,
        NOW() + INTERVAL '1 day', NOW() + INTERVAL '7 days', 30, 50, FALSE, ARRAY['technology', 'upgrade', 'infrastructure']
      )
    `, [userId]);
    
    console.log('✅ DAO proposals inserted:', proposalResult.rowCount);

    // Insert sample DAO votes
    const voteResult = await pool.query(`
      INSERT INTO dao_votes (
        proposal_id, voter_address, voter_user_id, vote_type, voting_power, voter_role, reason
      ) VALUES
      (
        1, '0x5F3C518A32d307A9372523e93d02A56e4F229AC6', $1, 'FOR', 100000, 'FARMER', 'Supports increased incentives for staking.'
      ),
      (
        1, '0x1234567890123456789012345678901234567890', $1, 'AGAINST', 50000, 'INVESTOR', 'Concerned about treasury depletion.'
      ),
      (
        2, '0x5F3C518A32d307A9372523e93d02A56e4F229AC6', $1, 'FOR', 75000, 'RESEARCHER', 'Crucial for agricultural innovation.'
      ),
      (
        3, '0x5F3C518A32d307A9372523e93d02A56e4F229AC6', $1, 'FOR', 120000, 'NGO', 'Directly benefits vulnerable farming communities.'
      ),
      (
        4, '0x5F3C518A32d307A9372523e93d02A56e4F229AC6', $1, 'FOR', 90000, 'FARMER', 'Great opportunity for additional income.'
      ),
      (
        4, '0x1234567890123456789012345678901234567890', $1, 'AGAINST', 30000, 'INVESTOR', 'Complex implementation concerns.'
      )
    `, [userId]);
    
    console.log('✅ DAO votes inserted:', voteResult.rowCount);

    res.json({
      success: true,
      message: 'DAO data seeded successfully',
      proposals: proposalResult.rowCount,
      votes: voteResult.rowCount
    });
  } catch (error) {
    console.error('❌ Error seeding DAO data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to seed NFT data
app.post('/api/debug/seed-nfts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('🌱 Seeding NFT data for user:', userId);
    
            // Sample agricultural land NFTs (using 6 decimals: 1 KRSI = 1,000,000 wei)
            const sampleNFTs = [
              {
                name: 'Premium Rice Farm - Punjab',
                description: 'A 50-acre premium rice farm in Punjab with excellent irrigation facilities and fertile soil. Perfect for organic farming.',
                image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400',
                price_wei: '1000000', // 1 KRSI (1,000,000 wei with 6 decimals)
                token_id: 'LAND001',
                contract_address: '0x1234567890123456789012345678901234567890',
                owner_id: userId
              },
              {
                name: 'Organic Wheat Fields - Haryana',
                description: 'Certified organic wheat fields spanning 30 acres in Haryana. Includes modern farming equipment and storage facilities.',
                image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
                price_wei: '750000', // 0.75 KRSI
                token_id: 'LAND002',
                contract_address: '0x1234567890123456789012345678901234567890',
                owner_id: userId
              },
              {
                name: 'Sugarcane Plantation - Maharashtra',
                description: 'A 40-acre sugarcane plantation with advanced irrigation system and processing unit. High yield potential.',
                image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
                price_wei: '1200000', // 1.2 KRSI
                token_id: 'LAND003',
                contract_address: '0x1234567890123456789012345678901234567890',
                owner_id: userId
              },
              {
                name: 'Cotton Farm - Gujarat',
                description: 'Premium cotton farm with 35 acres of land. Features modern harvesting equipment and excellent soil quality.',
                image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
                price_wei: '900000', // 0.9 KRSI
                token_id: 'LAND004',
                contract_address: '0x1234567890123456789012345678901234567890',
                owner_id: userId
              },
              {
                name: 'Spice Garden - Kerala',
                description: 'Aromatic spice garden with 25 acres of land growing cardamom, pepper, and vanilla. Traditional farming methods.',
                image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
                price_wei: '1500000', // 1.5 KRSI
                token_id: 'LAND005',
                contract_address: '0x1234567890123456789012345678901234567890',
                owner_id: userId
              },
              {
                name: 'Tea Estate - Assam',
                description: 'Historic tea estate with 60 acres of premium tea plantations. Includes processing facility and worker housing.',
                image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
                price_wei: '2000000', // 2 KRSI
                token_id: 'LAND006',
                contract_address: '0x1234567890123456789012345678901234567890',
                owner_id: userId
              }
            ];
    
    // Insert sample NFTs
    const insertedNFTs = [];
    for (const nft of sampleNFTs) {
      const result = await pool.query(
        `INSERT INTO nfts (name, description, image_url, price_wei, token_id, contract_address, owner_id, is_listed)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [nft.name, nft.description, nft.image_url, nft.price_wei, nft.token_id, nft.contract_address, nft.owner_id, true]
      );
      insertedNFTs.push(result.rows[0]);
    }
    
    console.log('✅ Successfully seeded', insertedNFTs.length, 'NFTs');
    
    res.json({
      message: 'NFTs seeded successfully',
      count: insertedNFTs.length,
      nfts: insertedNFTs
    });
  } catch (error) {
    console.error('Error seeding NFTs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to test balance update
app.post('/api/debug/update-balance', authenticateToken, async (req, res) => {
  try {
    const { address, balance_wei } = req.body;
    const userId = req.user.id;
    
    console.log('🔍 Debug update request:', { userId, address, balance_wei });
    
    // Direct update without any conditions
    const result = await pool.query(
      `UPDATE wallet_accounts 
       SET balance_wei = $1::bigint, updated_at = NOW()
       WHERE address = $2
       RETURNING *`,
      [balance_wei, address]
    );
    
    console.log('🔍 Debug update result:', result.rows);
    
    res.json({
      message: 'Debug update completed',
      updated_rows: result.rows.length,
      wallet: result.rows[0] || null
    });
  } catch (error) {
    console.error('Debug update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all listed NFTs
app.get('/api/nfts', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.*, u.first_name, u.last_name 
       FROM nfts n 
       LEFT JOIN users u ON n.owner_id = u.id 
       ORDER BY n.created_at DESC`
    );
    
    res.json({
      message: 'NFTs fetched successfully',
      count: result.rows.length,
      nfts: result.rows
    });
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a draft NFT (database-only)
app.post('/api/nfts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, image_url, price_krsi } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    // price_krsi is optional; convert to on-chain units (6 decimals) if provided
    let priceWei = '0';
    if (price_krsi !== undefined && price_krsi !== null && String(price_krsi).trim() !== '') {
      // store as bigint string with 6 decimals (KRSI)
      const parts = String(price_krsi).split('.');
      const whole = parts[0] || '0';
      const frac = (parts[1] || '').padEnd(6, '0').slice(0, 6);
      priceWei = `${BigInt(whole)}${frac}`;
    }

    const result = await pool.query(
      `INSERT INTO nfts (name, description, image_url, price_wei, owner_id, is_listed)
       VALUES ($1, $2, $3, $4::bigint, $5, $6)
       RETURNING *`,
      [name, description || null, image_url || null, priceWei, userId, false]
    );

    const nft = result.rows[0];

    // Ensure admin_approvals table exists (defensive for dev environments)
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS admin_approvals (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id),
          approval_type VARCHAR(100) NOT NULL,
          status VARCHAR(32) NOT NULL DEFAULT 'pending',
          request_data JSONB,
          admin_notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
    } catch (e) {
      // ignore if creation fails due to permissions; we'll still return NFT
      console.warn('admin_approvals ensure skipped:', e.message);
    }

    // Create admin approval request for on-chain minting (best-effort)
    try {
      await pool.query(
        `INSERT INTO admin_approvals (user_id, approval_type, status, request_data)
         VALUES ($1, $2, $3, $4)`,
        [userId, 'nft_mint', 'pending', JSON.stringify({ nft_id: nft.id, name, image_url, price_krsi, description })]
      );
    } catch (e) {
      console.warn('admin approval insert failed:', e.message);
    }

    res.status(201).json({
      message: 'NFT created successfully and approval requested',
      nft
    });
  } catch (error) {
    console.error('Error creating NFT:', error);
    const message = error?.message || 'Internal server error';
    res.status(500).json({ error: message });
  }
});

// Wallet endpoints

// Create or sync wallet
app.post('/api/wallet/sync', authenticateToken, async (req, res) => {
  try {
    const { address, balance_wei, wallet_type, metadata } = req.body;
    const userId = req.user.id;

    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    console.log('🔍 Wallet sync request received:', {
      userId,
      address,
      balance_wei: balance_wei,
      balance_wei_type: typeof balance_wei,
      wallet_type: wallet_type,
      metadata: metadata,
      full_body: req.body
    });

    // First, ensure the table has all required columns
    await ensureWalletTableSchema();

    // Check if wallet already exists by address OR by user_id
    const existingWallet = await pool.query(
      'SELECT id FROM wallet_accounts WHERE user_id = $1 AND wallet_type = $2',
      [userId, wallet_type || 'agrifinance']
    );

    // Also check if this address already exists for any user
    const existingAddress = await pool.query(
      'SELECT id, user_id FROM wallet_accounts WHERE address = $1',
      [address]
    );

    console.log('🔍 Existing wallet check results:', {
      existingWalletCount: existingWallet.rows.length,
      existingAddressCount: existingAddress.rows.length,
      existingWalletRows: existingWallet.rows,
      existingAddressRows: existingAddress.rows
    });

    if (existingWallet.rows.length > 0) {
      // Update existing wallet for this user
      console.log('🔄 Updating existing wallet with balance_wei:', balance_wei);
      const result = await pool.query(
        `UPDATE wallet_accounts 
         SET address = $1, balance_wei = $2::bigint, updated_at = NOW()
         WHERE user_id = $3 AND wallet_type = $4
         RETURNING *`,
        [address, balance_wei || '0', userId, wallet_type || 'agrifinance']
      );

      // Update metadata separately if the column exists
      try {
        await pool.query(
          `UPDATE wallet_accounts 
           SET metadata = $1
           WHERE user_id = $2 AND wallet_type = $3`,
          [JSON.stringify(metadata || {}), userId, wallet_type || 'agrifinance']
        );
      } catch (metaError) {
        console.log('Metadata update skipped (column may not exist):', metaError.message);
      }

      res.json({
        message: 'Wallet updated successfully',
        wallet: result.rows[0]
      });
    } else if (existingAddress.rows.length > 0) {
      // Address exists but for a different user - update the user_id
      const result = await pool.query(
        `UPDATE wallet_accounts 
         SET user_id = $1, balance_wei = $2::bigint, updated_at = NOW()
         WHERE address = $3
         RETURNING *`,
        [userId, balance_wei || '0', address]
      );

      // Update metadata separately if the column exists
      try {
        await pool.query(
          `UPDATE wallet_accounts 
           SET metadata = $1
           WHERE address = $2`,
          [JSON.stringify(metadata || {}), address]
        );
      } catch (metaError) {
        console.log('Metadata update skipped (column may not exist):', metaError.message);
      }

      res.json({
        message: 'Wallet ownership updated successfully',
        wallet: result.rows[0]
      });
    } else {
      // Create new wallet - use a safe insert query
      const result = await pool.query(
        `INSERT INTO wallet_accounts (user_id, address, wallet_type, balance_wei)
         VALUES ($1, $2, $3, $4::bigint)
         RETURNING *`,
        [userId, address, wallet_type || 'agrifinance', balance_wei || '0']
      );

      // Add additional columns if they exist
      try {
        await pool.query(
          `UPDATE wallet_accounts 
           SET chain_id = $1, token_symbol = $2, custodial = $3, metadata = $4
           WHERE id = $5`,
          ['amoy', 'KRSI', true, JSON.stringify(metadata || {}), result.rows[0].id]
        );
      } catch (updateError) {
        console.log('Additional columns update skipped:', updateError.message);
      }

      res.status(201).json({
        message: 'Wallet created successfully',
        wallet: result.rows[0]
      });
    }

  } catch (error) {
    console.error('Wallet sync error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's wallet
app.get('/api/wallet', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM wallet_accounts WHERE user_id = $1 AND wallet_type = $2',
      [userId, 'agrifinance']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({
      wallet: result.rows[0]
    });

  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update wallet balance
app.put('/api/wallet/balance', authenticateToken, async (req, res) => {
  try {
    const { balance_wei } = req.body;
    const userId = req.user.id;

    if (!balance_wei) {
      return res.status(400).json({ error: 'Balance is required' });
    }

    const result = await pool.query(
      `UPDATE wallet_accounts 
       SET balance_wei = $1, updated_at = NOW()
       WHERE user_id = $2 AND wallet_type = $3
       RETURNING *`,
      [balance_wei, userId, 'agrifinance']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({
      message: 'Balance updated successfully',
      wallet: result.rows[0]
    });

  } catch (error) {
    console.error('Update balance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Link mobile number to wallet
app.put('/api/wallet/link-mobile', authenticateToken, async (req, res) => {
  try {
    const { mobile_number } = req.body;
    const userId = req.user.id;

    if (!mobile_number) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    // Get current wallet
    const walletResult = await pool.query(
      'SELECT * FROM wallet_accounts WHERE user_id = $1 AND wallet_type = $2',
      [userId, 'agrifinance']
    );

    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const currentMetadata = walletResult.rows[0].metadata || {};
    const updatedMetadata = {
      ...currentMetadata,
      mobile_number,
      mobile_linked_at: new Date().toISOString()
    };

    const result = await pool.query(
      `UPDATE wallet_accounts 
       SET metadata = $1, updated_at = NOW()
       WHERE user_id = $2 AND wallet_type = $3
       RETURNING *`,
      [JSON.stringify(updatedMetadata), userId, 'agrifinance']
    );

    res.json({
      message: 'Mobile number linked successfully',
      wallet: result.rows[0]
    });

  } catch (error) {
    console.error('Link mobile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Find wallet by mobile number
app.get('/api/wallet/find-by-mobile/:mobile', authenticateToken, async (req, res) => {
  try {
    const { mobile } = req.params;

    const result = await pool.query(
      `SELECT address, metadata FROM wallet_accounts 
       WHERE wallet_type = $1 AND metadata->>'mobile_number' = $2`,
      ['agrifinance', mobile]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found for this mobile number' });
    }

    res.json({
      wallet: result.rows[0]
    });

  } catch (error) {
    console.error('Find wallet by mobile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== FARMER PROFILE API ENDPOINTS ====================

// Get farmer profile
app.get('/api/farmer/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT fp.*, u.first_name, u.last_name, u.email
      FROM farmer_profiles fp
      LEFT JOIN users u ON fp.user_id = u.id
      WHERE fp.user_id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      // Create default profile if none exists
      await pool.query(`
        INSERT INTO farmer_profiles (user_id, land_area_acres, total_loans, active_loans, 
                                   completed_loans, total_batches, verified_batches, land_nfts)
        VALUES ($1, 0, 0, 0, 0, 0, 0, 0)
      `, [userId]);

      const newResult = await pool.query(`
        SELECT fp.*, u.first_name, u.last_name, u.email
        FROM farmer_profiles fp
        LEFT JOIN users u ON fp.user_id = u.id
        WHERE fp.user_id = $1
      `, [userId]);

      return res.json({ profile: newResult.rows[0] });
    }

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Get farmer profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update farmer profile
app.put('/api/farmer/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      land_area_acres,
      farming_experience_years,
      primary_crops,
      farming_method,
      irrigation_type,
      soil_type,
      region,
      village,
      state,
      country,
      phone_number,
      emergency_contact
    } = req.body;

    const result = await pool.query(`
      INSERT INTO farmer_profiles (
        user_id, land_area_acres, farming_experience_years, primary_crops,
        farming_method, irrigation_type, soil_type, region, village, state,
        country, phone_number, emergency_contact
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (user_id) DO UPDATE SET
        land_area_acres = EXCLUDED.land_area_acres,
        farming_experience_years = EXCLUDED.farming_experience_years,
        primary_crops = EXCLUDED.primary_crops,
        farming_method = EXCLUDED.farming_method,
        irrigation_type = EXCLUDED.irrigation_type,
        soil_type = EXCLUDED.soil_type,
        region = EXCLUDED.region,
        village = EXCLUDED.village,
        state = EXCLUDED.state,
        country = EXCLUDED.country,
        phone_number = EXCLUDED.phone_number,
        emergency_contact = EXCLUDED.emergency_contact,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      userId, land_area_acres, farming_experience_years, primary_crops,
      farming_method, irrigation_type, soil_type, region, village, state,
      country, phone_number, emergency_contact
    ]);

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Update farmer profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get farmer statistics
app.get('/api/farmer/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get farmer profile
    const profileResult = await pool.query(`
      SELECT * FROM farmer_profiles WHERE user_id = $1
    `, [userId]);

    // Get loan statistics
    const loanStats = await pool.query(`
      SELECT 
        COUNT(*) as total_loans,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_loans,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_loans,
        SUM(CASE WHEN status = 'active' THEN loan_amount ELSE 0 END) as active_loan_amount
      FROM farmer_loans WHERE farmer_id = $1
    `, [userId]);

    // Get batch statistics
    const batchStats = await pool.query(`
      SELECT 
        COUNT(*) as total_batches,
        COUNT(CASE WHEN certification_status = 'verified' THEN 1 END) as verified_batches,
        SUM(quantity_kg) as total_quantity_kg,
        SUM(total_value) as total_value
      FROM farmer_batches WHERE farmer_id = $1
    `, [userId]);

    // Get NFT statistics
    const nftStats = await pool.query(`
      SELECT COUNT(*) as land_nfts
      FROM nfts WHERE owner_id = $1
    `, [userId]);

    const profile = profileResult.rows[0] || {};
    const loans = loanStats.rows[0] || {};
    const batches = batchStats.rows[0] || {};
    const nfts = nftStats.rows[0] || {};

    res.json({
      stats: {
        land_area_acres: profile.land_area_acres || 0,
        total_loans: parseInt(loans.total_loans) || 0,
        active_loans: parseInt(loans.active_loans) || 0,
        completed_loans: parseInt(loans.completed_loans) || 0,
        active_loan_amount: parseFloat(loans.active_loan_amount) || 0,
        total_batches: parseInt(batches.total_batches) || 0,
        verified_batches: parseInt(batches.verified_batches) || 0,
        total_quantity_kg: parseFloat(batches.total_quantity_kg) || 0,
        total_batch_value: parseFloat(batches.total_value) || 0,
        land_nfts: parseInt(nfts.land_nfts) || 0,
        farming_experience_years: profile.farming_experience_years || 0,
        primary_crops: profile.primary_crops || [],
        region: profile.region || 'Not specified'
      }
    });
  } catch (error) {
    console.error('Get farmer stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== FARMER BATCHES API ENDPOINTS ====================

// Get farmer batches
app.get('/api/farmer/batches', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT * FROM farmer_batches 
      WHERE farmer_id = $1 
      ORDER BY created_at DESC
    `, [userId]);

    res.json({ batches: result.rows });
  } catch (error) {
    console.error('Get farmer batches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create farmer batch
app.post('/api/farmer/batches', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      crop_type,
      variety,
      quantity_kg,
      harvest_date,
      quality_grade,
      certification_status,
      batch_number,
      storage_location,
      price_per_kg,
      total_value
    } = req.body;

    const result = await pool.query(`
      INSERT INTO farmer_batches (
        farmer_id, crop_type, variety, quantity_kg, harvest_date,
        quality_grade, certification_status, batch_number, storage_location,
        price_per_kg, total_value
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      userId, crop_type, variety, quantity_kg, harvest_date,
      quality_grade, certification_status, batch_number, storage_location,
      price_per_kg, total_value
    ]);

    res.json({ batch: result.rows[0] });
  } catch (error) {
    console.error('Create farmer batch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== END FARMER BATCHES API ENDPOINTS ====================

// ==================== END FARMER PROFILE API ENDPOINTS ====================

// Create wallet transaction record
app.post('/api/wallet/transaction', authenticateToken, async (req, res) => {
  try {
    const { 
      direction, 
      amount_wei, 
      to_address, 
      from_address, 
      blockchain_tx_hash, 
      metadata 
    } = req.body;
    const userId = req.user.id;

    // Get user's wallet
    const walletResult = await pool.query(
      'SELECT id FROM wallet_accounts WHERE user_id = $1 AND wallet_type = $2',
      [userId, 'agrifinance']
    );

    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const walletId = walletResult.rows[0].id;

    const result = await pool.query(
      `INSERT INTO wallet_transactions 
       (user_id, wallet_id, direction, amount_wei, token_symbol, status, to_address, from_address, blockchain_tx_hash, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        userId, 
        walletId, 
        direction, 
        amount_wei, 
        'KRSI', 
        'completed', 
        to_address, 
        from_address, 
        blockchain_tx_hash, 
        JSON.stringify(metadata || {})
      ]
    );

    res.status(201).json({
      message: 'Transaction recorded successfully',
      transaction: result.rows[0]
    });

  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Import blockchain service
const BlockchainService = require('./services/blockchainService');
const blockchainService = new BlockchainService();

// Import reconciliation service
const TransactionReconciliationService = require('./services/reconciliationService');
const reconciliationService = new TransactionReconciliationService(blockchainService);

// Initialize blockchain service
blockchainService.initializeContracts().then(() => {
  console.log('🔗 Blockchain service initialized');
  
  // Start event listening in production
  if (process.env.NODE_ENV === 'production') {
    blockchainService.startEventListening();
  }
  
  // Start reconciliation service
  reconciliationService.startReconciliation(5); // Every 5 minutes
  console.log('🔄 Transaction reconciliation service started');
}).catch(error => {
  console.error('❌ Failed to initialize blockchain service:', error);
});

// Hybrid transaction endpoints

// Execute token transfer (blockchain + database)
app.post('/api/wallet/transfer', authenticateToken, async (req, res) => {
  try {
    const { to_address, amount_wei, private_key } = req.body;
    const userId = req.user.id;

    // Get user's wallet
    const walletResult = await pool.query(
      'SELECT * FROM wallet_accounts WHERE user_id = $1 AND wallet_type = $2',
      [userId, 'agrifinance']
    );

    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const wallet = walletResult.rows[0];
    const fromAddress = wallet.address;

    // Validate balance
    const currentBalance = BigInt(wallet.balance_wei);
    const transferAmount = BigInt(amount_wei);
    
    if (currentBalance < transferAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Execute blockchain transaction
    const blockchainResult = await blockchainService.executeTokenTransfer(
      fromAddress,
      to_address,
      amount_wei,
      private_key || wallet.metadata.private_key
    );

    if (!blockchainResult.success) {
      return res.status(400).json({ 
        error: 'Blockchain transaction failed', 
        details: blockchainResult.error 
      });
    }

    // Update database
    const newBalance = (currentBalance - transferAmount).toString();
    
    await pool.query(
      `UPDATE wallet_accounts 
       SET balance_wei = $1::bigint, updated_at = NOW()
       WHERE id = $2`,
      [newBalance, wallet.id]
    );

    // Record transaction in database
    const transactionResult = await pool.query(
      `INSERT INTO wallet_transactions 
       (user_id, wallet_id, direction, amount_wei, token_symbol, status, to_address, from_address, blockchain_tx_hash, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        userId,
        wallet.id,
        'out',
        amount_wei,
        'KRSI',
        'completed',
        to_address,
        fromAddress,
        blockchainResult.txHash,
        JSON.stringify({
          blockNumber: blockchainResult.blockNumber,
          gasUsed: blockchainResult.gasUsed,
          timestamp: new Date().toISOString()
        })
      ]
    );

    res.status(201).json({
      message: 'Transfer completed successfully',
      transaction: transactionResult.rows[0],
      blockchain: {
        txHash: blockchainResult.txHash,
        blockNumber: blockchainResult.blockNumber,
        gasUsed: blockchainResult.gasUsed
      }
    });

  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Set NFT price endpoint
app.post('/api/nft/set-price', authenticateToken, async (req, res) => {
  try {
    const { nft_id, token_id, price_wei } = req.body;

    if (!price_wei || (!nft_id && !token_id)) {
      return res.status(400).json({ error: 'price_wei and (nft_id or token_id) are required' });
    }

    // Update DB price if nft_id provided
    if (nft_id) {
      await pool.query(
        `UPDATE nfts SET price_wei = $1::bigint, is_listed = true, updated_at = NOW() WHERE id = $2`,
        [price_wei, nft_id]
      );
    } else {
      // fallback by token_id
      await pool.query(
        `UPDATE nfts SET price_wei = $1::bigint, is_listed = true, updated_at = NOW() WHERE token_id = $2`,
        [price_wei, token_id]
      );
    }

    res.status(200).json({ message: 'NFT price set (DB only)' });
  } catch (error) {
    console.error('Set NFT price error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Alias: create NFT (to avoid 404s from some clients)
app.post('/api/nft', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, image_url, price_krsi } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    let priceWei = '0';
    if (price_krsi !== undefined && price_krsi !== null && String(price_krsi).trim() !== '') {
      const parts = String(price_krsi).split('.');
      const whole = parts[0] || '0';
      const frac = (parts[1] || '').padEnd(6, '0').slice(0, 6);
      priceWei = `${BigInt(whole)}${frac}`;
    }

    const result = await pool.query(
      `INSERT INTO nfts (name, description, image_url, price_wei, owner_id, is_listed)
       VALUES ($1, $2, $3, $4::bigint, $5, $6)
       RETURNING *`,
      [name, description || null, image_url || null, priceWei, userId, false]
    );

    const nft = result.rows[0];
    try {
      await pool.query(
        `INSERT INTO admin_approvals (user_id, approval_type, status, request_data)
         VALUES ($1, $2, $3, $4)`,
        [userId, 'nft_mint', 'pending', JSON.stringify({ nft_id: nft.id, name, image_url, price_krsi, description })]
      );
    } catch (e) {
      console.warn('admin approval insert failed (alias route):', e.message);
    }

    res.status(201).json({ message: 'NFT created successfully and approval requested', nft });
  } catch (error) {
    console.error('Alias create NFT error:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// Execute staking (blockchain + database)
app.post('/api/wallet/stake', authenticateToken, async (req, res) => {
  try {
    const { amount_wei, lock_period_seconds, private_key } = req.body;
    const userId = req.user.id;

    // Get user's wallet
    const walletResult = await pool.query(
      'SELECT * FROM wallet_accounts WHERE user_id = $1 AND wallet_type = $2',
      [userId, 'agrifinance']
    );

    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const wallet = walletResult.rows[0];
    const userAddress = wallet.address;

    // Validate balance
    const currentBalance = BigInt(wallet.balance_wei);
    const stakeAmount = BigInt(amount_wei);
    
    if (currentBalance < stakeAmount) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        details: {
          currentBalance: currentBalance.toString(),
          stakeAmount: stakeAmount.toString(),
          shortfall: (stakeAmount - currentBalance).toString()
        }
      });
    }

    // Additional validation: ensure minimum staking amount
    const minimumStake = BigInt('1000000'); // 1 KRSI minimum (with 6 decimals)
    if (stakeAmount < minimumStake) {
      return res.status(400).json({ 
        error: 'Minimum staking amount is 1 KRSI',
        details: {
          minimumStake: minimumStake.toString(),
          providedAmount: stakeAmount.toString()
        }
      });
    }

    // Execute blockchain staking
    const blockchainResult = await blockchainService.executeStaking(
      userAddress,
      amount_wei,
      lock_period_seconds,
      private_key || wallet.metadata.private_key
    );

    if (!blockchainResult.success) {
      return res.status(400).json({ 
        error: 'Blockchain staking failed', 
        details: blockchainResult.error 
      });
    }

    // Update database balance
    const newBalance = (currentBalance - stakeAmount).toString();
    
    await pool.query(
      `UPDATE wallet_accounts 
       SET balance_wei = $1::bigint, updated_at = NOW()
       WHERE id = $2`,
      [newBalance, wallet.id]
    );

    // Record staking transaction
    const transactionResult = await pool.query(
      `INSERT INTO wallet_transactions 
       (user_id, wallet_id, direction, amount_wei, token_symbol, status, to_address, from_address, blockchain_tx_hash, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        userId,
        wallet.id,
        'out',
        amount_wei,
        'KRSI',
        'completed',
        'STAKING_CONTRACT',
        userAddress,
        blockchainResult.txHash,
        JSON.stringify({
          transactionType: 'staking',
          lockPeriod: lock_period_seconds,
          blockNumber: blockchainResult.blockNumber,
          gasUsed: blockchainResult.gasUsed,
          timestamp: new Date().toISOString()
        })
      ]
    );

    res.status(201).json({
      message: 'Staking completed successfully',
      transaction: transactionResult.rows[0],
      blockchain: {
        txHash: blockchainResult.txHash,
        blockNumber: blockchainResult.blockNumber,
        gasUsed: blockchainResult.gasUsed
      }
    });

  } catch (error) {
    console.error('Staking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sync wallet with blockchain
app.post('/api/wallet/sync-blockchain', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's wallet
    const walletResult = await pool.query(
      'SELECT * FROM wallet_accounts WHERE user_id = $1 AND wallet_type = $2',
      [userId, 'agrifinance']
    );

    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const wallet = walletResult.rows[0];

    // Sync with blockchain
    const syncResult = await blockchainService.syncWithBlockchain(userId, wallet.address);

    if (!syncResult.success) {
      return res.status(400).json({ 
        error: 'Blockchain sync failed', 
        details: syncResult.error 
      });
    }

    res.json({
      message: 'Blockchain sync completed',
      data: syncResult.data
    });

  } catch (error) {
    console.error('Blockchain sync error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get blockchain staking data
app.get('/api/wallet/staking-data', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's wallet
    const walletResult = await pool.query(
      'SELECT * FROM wallet_accounts WHERE user_id = $1 AND wallet_type = $2',
      [userId, 'agrifinance']
    );

    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const wallet = walletResult.rows[0];

    // Get blockchain staking data
    const stakingResult = await blockchainService.getBlockchainStakingData(wallet.address);

    if (!stakingResult.success) {
      return res.status(400).json({ 
        error: 'Failed to get staking data', 
        details: stakingResult.error 
      });
    }

    res.json({
      message: 'Staking data retrieved',
      data: stakingResult
    });

  } catch (error) {
    console.error('Staking data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify transaction on blockchain
app.post('/api/wallet/verify-transaction', authenticateToken, async (req, res) => {
  try {
    const { tx_hash } = req.body;

    const verificationResult = await blockchainService.verifyTransaction(tx_hash);

    if (!verificationResult.success) {
      return res.status(400).json({ 
        error: 'Transaction verification failed', 
        details: verificationResult.error 
      });
    }

    res.json({
      message: 'Transaction verified',
      data: verificationResult
    });

  } catch (error) {
    console.error('Transaction verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// NFT Transaction endpoints

// Execute NFT purchase (blockchain + database)
app.post('/api/nft/purchase', authenticateToken, async (req, res) => {
  try {
    const { nft_id, token_id, price_wei, private_key } = req.body;
    const userId = req.user.id;

    // Get buyer's wallet
    const walletResult = await pool.query(
      'SELECT * FROM wallet_accounts WHERE user_id = $1 AND wallet_type = $2',
      [userId, 'agrifinance']
    );

    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const buyerWallet = walletResult.rows[0];
    const buyerAddress = buyerWallet.address;

    // Get NFT details
    const nftResult = await pool.query(
      'SELECT * FROM nfts WHERE id = $1 AND is_listed = true',
      [nft_id]
    );

    if (nftResult.rows.length === 0) {
      return res.status(404).json({ error: 'NFT not found or not listed' });
    }

    const nft = nftResult.rows[0];

    // Validate price
    const nftPrice = BigInt(nft.price_wei);
    const purchasePrice = BigInt(price_wei);
    
    if (nftPrice !== purchasePrice) {
      return res.status(400).json({ error: 'Price mismatch' });
    }

    // Validate buyer balance
    const buyerBalance = BigInt(buyerWallet.balance_wei);
    if (buyerBalance < purchasePrice) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Execute blockchain NFT purchase
    const blockchainResult = await blockchainService.executeNFTPurchase(
      buyerAddress,
      token_id,
      price_wei,
      private_key || buyerWallet.metadata.private_key
    );

    if (!blockchainResult.success) {
      return res.status(400).json({ 
        error: 'Blockchain NFT purchase failed', 
        details: blockchainResult.error 
      });
    }

    // Update database
    // Update buyer balance
    const newBuyerBalance = (buyerBalance - purchasePrice).toString();
    await pool.query(
      `UPDATE wallet_accounts 
       SET balance_wei = $1::bigint, updated_at = NOW()
       WHERE id = $2`,
      [newBuyerBalance, buyerWallet.id]
    );

    // Update seller balance (if seller has wallet)
    const sellerResult = await pool.query(
      'SELECT wa.* FROM wallet_accounts wa WHERE wa.user_id = $1',
      [nft.owner_id]
    );

    if (sellerResult.rows.length > 0) {
      const sellerWallet = sellerResult.rows[0];
      const sellerBalance = BigInt(sellerWallet.balance_wei);
      const newSellerBalance = (sellerBalance + purchasePrice).toString();
      
      await pool.query(
        `UPDATE wallet_accounts 
         SET balance_wei = $1::bigint, updated_at = NOW()
         WHERE id = $2`,
        [newSellerBalance, sellerWallet.id]
      );
    }

    // Update NFT ownership
    await pool.query(
      `UPDATE nfts 
       SET owner_id = $1, is_listed = false, updated_at = NOW()
       WHERE id = $2`,
      [userId, nft_id]
    );

    // Record transactions
    const transactionResult = await pool.query(
      `INSERT INTO wallet_transactions 
       (user_id, wallet_id, direction, amount_wei, token_symbol, status, to_address, from_address, blockchain_tx_hash, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        userId,
        buyerWallet.id,
        'out',
        price_wei,
        'KRSI',
        'completed',
        nft.owner_id,
        buyerAddress,
        blockchainResult.txHash,
        JSON.stringify({
          transactionType: 'nft_purchase',
          nftId: nft_id,
          tokenId: token_id,
          blockNumber: blockchainResult.blockNumber,
          gasUsed: blockchainResult.gasUsed,
          timestamp: new Date().toISOString()
        })
      ]
    );

    res.status(201).json({
      message: 'NFT purchase completed successfully',
      transaction: transactionResult.rows[0],
      blockchain: {
        txHash: blockchainResult.txHash,
        blockNumber: blockchainResult.blockNumber,
        gasUsed: blockchainResult.gasUsed
      },
      nft: {
        id: nft_id,
        newOwner: userId
      }
    });

  } catch (error) {
    console.error('NFT purchase error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Execute NFT transfer (blockchain + database)
app.post('/api/nft/transfer', authenticateToken, async (req, res) => {
  try {
    const { nft_id, token_id, to_address, private_key } = req.body;
    const userId = req.user.id;

    // Get sender's wallet
    const walletResult = await pool.query(
      'SELECT * FROM wallet_accounts WHERE user_id = $1 AND wallet_type = $2',
      [userId, 'agrifinance']
    );

    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const senderWallet = walletResult.rows[0];
    const senderAddress = senderWallet.address;

    // Get NFT details
    const nftResult = await pool.query(
      'SELECT * FROM nfts WHERE id = $1 AND owner_id = $2',
      [nft_id, userId]
    );

    if (nftResult.rows.length === 0) {
      return res.status(404).json({ error: 'NFT not found or not owned by user' });
    }

    const nft = nftResult.rows[0];

    // Execute blockchain NFT transfer
    const blockchainResult = await blockchainService.executeNFTTransfer(
      senderAddress,
      to_address,
      token_id,
      private_key || senderWallet.metadata.private_key
    );

    if (!blockchainResult.success) {
      return res.status(400).json({ 
        error: 'Blockchain NFT transfer failed', 
        details: blockchainResult.error 
      });
    }

    // Find recipient user by wallet address
    const recipientResult = await pool.query(
      'SELECT u.id FROM users u JOIN wallet_accounts wa ON u.id = wa.user_id WHERE wa.address = $1',
      [to_address]
    );

    let recipientUserId = null;
    if (recipientResult.rows.length > 0) {
      recipientUserId = recipientResult.rows[0].id;
    }

    // Update NFT ownership in database
    await pool.query(
      `UPDATE nfts 
       SET owner_id = $1, updated_at = NOW()
       WHERE id = $2`,
      [recipientUserId, nft_id]
    );

    // Record transaction
    const transactionResult = await pool.query(
      `INSERT INTO wallet_transactions 
       (user_id, wallet_id, direction, amount_wei, token_symbol, status, to_address, from_address, blockchain_tx_hash, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        userId,
        senderWallet.id,
        'out',
        '0', // NFT transfers don't involve token amounts
        'NFT',
        'completed',
        to_address,
        senderAddress,
        blockchainResult.txHash,
        JSON.stringify({
          transactionType: 'nft_transfer',
          nftId: nft_id,
          tokenId: token_id,
          blockNumber: blockchainResult.blockNumber,
          gasUsed: blockchainResult.gasUsed,
          timestamp: new Date().toISOString()
        })
      ]
    );

    res.status(201).json({
      message: 'NFT transfer completed successfully',
      transaction: transactionResult.rows[0],
      blockchain: {
        txHash: blockchainResult.txHash,
        blockNumber: blockchainResult.blockNumber,
        gasUsed: blockchainResult.gasUsed
      },
      nft: {
        id: nft_id,
        newOwner: recipientUserId
      }
    });

  } catch (error) {
    console.error('NFT transfer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sync NFT with blockchain
app.post('/api/nft/sync-blockchain', authenticateToken, async (req, res) => {
  try {
    const { nft_id, token_id } = req.body;
    const userId = req.user.id;

    // Verify NFT ownership
    const nftResult = await pool.query(
      'SELECT * FROM nfts WHERE id = $1 AND owner_id = $2',
      [nft_id, userId]
    );

    if (nftResult.rows.length === 0) {
      return res.status(404).json({ error: 'NFT not found or not owned by user' });
    }

    // Sync with blockchain
    const syncResult = await blockchainService.syncNFTWithBlockchain(nft_id, token_id);

    if (!syncResult.success) {
      return res.status(400).json({ 
        error: 'NFT blockchain sync failed', 
        details: syncResult.error 
      });
    }

    res.json({
      message: 'NFT blockchain sync completed',
      data: syncResult.data
    });

  } catch (error) {
    console.error('NFT blockchain sync error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reconciliation endpoints

// Manual reconciliation for user's wallet
app.post('/api/reconciliation/wallet', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's wallet
    const walletResult = await pool.query(
      'SELECT * FROM wallet_accounts WHERE user_id = $1 AND wallet_type = $2',
      [userId, 'agrifinance']
    );

    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const wallet = walletResult.rows[0];
    const reconcileResult = await reconciliationService.reconcileWallet(wallet.id);

    if (!reconcileResult.success) {
      return res.status(400).json({ 
        error: 'Wallet reconciliation failed', 
        details: reconcileResult.error 
      });
    }

    res.json({
      message: 'Wallet reconciliation completed',
      data: reconcileResult
    });

  } catch (error) {
    console.error('Wallet reconciliation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manual reconciliation for user's NFTs
app.post('/api/reconciliation/nfts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's NFTs
    const nftsResult = await pool.query(
      'SELECT * FROM nfts WHERE owner_id = $1 AND token_id IS NOT NULL',
      [userId]
    );

    const results = [];
    for (const nft of nftsResult.rows) {
      const reconcileResult = await reconciliationService.reconcileNFT(nft.id);
      results.push(reconcileResult);
    }

    res.json({
      message: 'NFT reconciliation completed',
      data: {
        nftsChecked: nftsResult.rows.length,
        results: results
      }
    });

  } catch (error) {
    console.error('NFT reconciliation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get reconciliation status (admin only)
app.get('/api/reconciliation/status', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const status = reconciliationService.getStatus();
    res.json({
      message: 'Reconciliation status retrieved',
      data: status
    });

  } catch (error) {
    console.error('Reconciliation status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Trigger manual reconciliation (admin only)
app.post('/api/reconciliation/trigger', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const results = await reconciliationService.performReconciliation();
    res.json({
      message: 'Manual reconciliation completed',
      data: results
    });

  } catch (error) {
    console.error('Manual reconciliation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DAO Endpoints

// Get all DAO proposals
app.get('/api/dao/proposals', authenticateToken, async (req, res) => {
  try {
    const { status, type, limit = 20, offset = 0 } = req.query;
    
    let query = `
      SELECT dp.*, u.first_name, u.last_name, u.email,
             COUNT(dv.id) as total_votes,
             CASE 
               WHEN dp.end_time < NOW() THEN 'EXPIRED'
               WHEN dp.start_time > NOW() THEN 'PENDING'
               WHEN dp.executed = true THEN 'EXECUTED'
               ELSE 'ACTIVE'
             END as current_status
      FROM dao_proposals dp
      LEFT JOIN users u ON dp.proposer_user_id = u.id
      LEFT JOIN dao_votes dv ON dp.proposal_id = dv.proposal_id
    `;
    
    const conditions = [];
    const params = [];
    let paramCount = 0;
    
    if (status) {
      paramCount++;
      conditions.push(`dp.status = $${paramCount}`);
      params.push(status);
    }
    
    if (type) {
      paramCount++;
      conditions.push(`dp.proposal_type = $${paramCount}`);
      params.push(type);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += `
      GROUP BY dp.id, u.id
      ORDER BY dp.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('DAO proposals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create DAO proposal
app.post('/api/dao/proposals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      detailed_proposal,
      proposal_type,
      tags = [],
      related_proposals = []
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !proposal_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get next proposal ID
    const proposalIdResult = await pool.query(
      'SELECT COALESCE(MAX(proposal_id), 0) + 1 as next_id FROM dao_proposals'
    );
    const proposalId = proposalIdResult.rows[0].next_id;
    
    // Calculate voting parameters based on proposal type
    const votingParams = getVotingParameters(proposal_type);
    
    const result = await pool.query(
      `INSERT INTO dao_proposals 
       (proposal_id, title, description, detailed_proposal, proposer_user_id, 
        proposal_type, start_time, end_time, quorum_required, threshold_required, tags, related_proposals)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW() + INTERVAL '7 days', $7, $8, $9, $10)
       RETURNING *`,
      [
        proposalId,
        title,
        description,
        detailed_proposal,
        userId,
        proposal_type,
        votingParams.quorum,
        votingParams.threshold,
        tags,
        related_proposals
      ]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Proposal created successfully'
    });
  } catch (error) {
    console.error('Create DAO proposal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vote on DAO proposal
app.post('/api/dao/proposals/:proposalId/vote', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { proposalId } = req.params;
    const { vote_type, reason } = req.body;
    
    // Validate vote type
    if (!['FOR', 'AGAINST', 'ABSTAIN'].includes(vote_type)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }
    
    // Check if proposal exists and is active
    const proposalResult = await pool.query(
      'SELECT * FROM dao_proposals WHERE proposal_id = $1',
      [proposalId]
    );
    
    if (proposalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    const proposal = proposalResult.rows[0];
    
    if (proposal.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Proposal is not active for voting' });
    }
    
    if (new Date() > new Date(proposal.end_time)) {
      return res.status(400).json({ error: 'Voting period has ended' });
    }
    
    // Check if user already voted
    const existingVote = await pool.query(
      'SELECT * FROM dao_votes WHERE proposal_id = $1 AND voter_user_id = $2',
      [proposalId, userId]
    );
    
    if (existingVote.rows.length > 0) {
      return res.status(400).json({ error: 'User has already voted on this proposal' });
    }
    
    // Get user profile and calculate voting power
    const userProfile = await pool.query(
      'SELECT * FROM dao_user_profiles WHERE user_id = $1',
      [userId]
    );
    
    if (userProfile.rows.length === 0) {
      return res.status(400).json({ error: 'User profile not found' });
    }
    
    const profile = userProfile.rows[0];
    const votingPower = calculateVotingPower(profile);
    
    if (votingPower <= 0) {
      return res.status(400).json({ error: 'Insufficient voting power' });
    }
    
    // Record the vote
    const voteResult = await pool.query(
      `INSERT INTO dao_votes 
       (proposal_id, voter_user_id, vote_type, voting_power, voter_role, reason)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [proposalId, userId, vote_type, votingPower, profile.user_role, reason]
    );
    
    // Update proposal vote counts
    const updateField = vote_type === 'FOR' ? 'votes_for' : 
                       vote_type === 'AGAINST' ? 'votes_against' : 'abstain_votes';
    
    await pool.query(
      `UPDATE dao_proposals SET ${updateField} = ${updateField} + $1 WHERE proposal_id = $2`,
      [votingPower, proposalId]
    );
    
    res.status(201).json({
      success: true,
      data: voteResult.rows[0],
      message: 'Vote recorded successfully'
    });
  } catch (error) {
    console.error('DAO vote error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get DAO user profile - simplified to use existing user data
app.get('/api/dao/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user data with wallet info - no need for separate DAO profile table
    const result = await pool.query(`
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.created_at,
        wa.address as wallet_address,
        wa.balance_wei,
        'FARMER' as user_role,
        CONCAT(u.first_name, ' ', u.last_name) as name,
        'AgriFinance Platform' as organization,
        'Agricultural Finance' as specialization,
        5 as farming_experience,
        10.5 as land_area,
        ARRAY['Organic Farming', 'Sustainable Agriculture'] as certifications,
        'Active participant in AgriFinance DAO governance' as bio,
        'India' as region,
        ARRAY['Rice', 'Wheat', 'Vegetables'] as crops_grown,
        85 as reputation_score,
        true as is_verified
      FROM users u
      LEFT JOIN wallet_accounts wa ON u.id = wa.user_id
      WHERE u.id = $1
    `, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('DAO profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update DAO user profile - simplified (just return success since we use existing user data)
app.put('/api/dao/profile', authenticateToken, async (req, res) => {
  try {
    // Since we're using existing user data, just return success
    // In a real implementation, you might update user profile fields here
    res.json({
      success: true,
      message: 'Profile updated successfully (using existing user data)'
    });
  } catch (error) {
    console.error('Update DAO profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get agricultural metrics
app.get('/api/dao/metrics', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM agricultural_metrics ORDER BY last_updated DESC LIMIT 1'
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Metrics not found' });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('DAO metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get DAO analytics
app.get('/api/dao/analytics', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const result = await pool.query(
      `SELECT 
         COUNT(*) as total_proposals,
         COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_proposals,
         COUNT(CASE WHEN executed = true THEN 1 END) as executed_proposals,
         SUM(votes_for + votes_against + abstain_votes) as total_votes_cast,
         COUNT(DISTINCT proposer_user_id) as unique_proposers
       FROM dao_proposals 
       WHERE created_at >= NOW() - INTERVAL '${parseInt(days)} days'`
    );
    
    const roleDistribution = await pool.query(
      `SELECT user_role, COUNT(*) as count
       FROM dao_user_profiles 
       WHERE is_verified = true
       GROUP BY user_role`
    );
    
    const proposalTypes = await pool.query(
      `SELECT proposal_type, COUNT(*) as count
       FROM dao_proposals 
       WHERE created_at >= NOW() - INTERVAL '${parseInt(days)} days'
       GROUP BY proposal_type`
    );
    
    res.json({
      success: true,
      data: {
        overview: result.rows[0],
        roleDistribution: roleDistribution.rows,
        proposalTypes: proposalTypes.rows
      }
    });
  } catch (error) {
    console.error('DAO analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions
function getVotingParameters(proposalType) {
  const params = {
    'PLATFORM_POLICY': { quorum: 30, threshold: 60 },
    'CROP_PRICING': { quorum: 40, threshold: 70 },
    'LOAN_TERMS': { quorum: 50, threshold: 75 },
    'FARMER_VERIFICATION': { quorum: 35, threshold: 65 },
    'SUSTAINABILITY': { quorum: 45, threshold: 70 },
    'TECHNOLOGY_UPGRADE': { quorum: 40, threshold: 65 },
    'EMERGENCY_RESPONSE': { quorum: 60, threshold: 80 },
    'TREASURY_MANAGEMENT': { quorum: 50, threshold: 75 },
    'PARTNERSHIP': { quorum: 40, threshold: 70 },
    'RESEARCH_FUNDING': { quorum: 35, threshold: 65 }
  };
  
  return params[proposalType] || params['PLATFORM_POLICY'];
}

function calculateVotingPower(profile) {
  let power = 0;
  
  // Base power from token holdings (would need to integrate with blockchain)
  power += 1000; // Placeholder
  
  // Farming experience bonus
  power += profile.farming_experience * 10;
  
  // Land area bonus
  power += Math.floor(profile.land_area * 5);
  
  // Reputation score bonus
  power += profile.reputation_score;
  
  // Role-based multiplier
  const roleMultipliers = {
    'FARMER': 1.5,
    'RESEARCHER': 1.3,
    'ADVISOR': 1.2,
    'GOVERNMENT': 1.1,
    'NGO': 1.1,
    'INVESTOR': 1.0,
    'CONSUMER': 0.8
  };
  
  power *= (roleMultipliers[profile.user_role] || 1.0);
  
  return Math.floor(power);
}

// Get wallet transactions
app.get('/api/wallet/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT wt.*, wa.address as wallet_address 
       FROM wallet_transactions wt
       JOIN wallet_accounts wa ON wt.wallet_id = wa.id
       WHERE wt.user_id = $1
       ORDER BY wt.created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json({
      transactions: result.rows
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

console.log('📡 About to start server on port', PORT);

// Start server with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 NeonDB API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Server accessible on all network interfaces`);
  console.log(`✅ Server is DEFINITELY listening now!`);
});

console.log('📡 app.listen() called, waiting for callback...');

server.on('error', (error) => {
  console.error('❌ Server error:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.error(`⚠️  Port ${PORT} is already in use`);
  }
  process.exit(1);
});

server.on('listening', () => {
  const addr = server.address();
  console.log(`🎧 Server is LISTENING on ${addr.address}:${addr.port}`);
});
