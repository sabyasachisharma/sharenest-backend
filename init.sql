-- Create a test table
CREATE TABLE IF NOT EXISTS test_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add some sample data
INSERT INTO test_table (name) VALUES ('Test Entry 1');
INSERT INTO test_table (name) VALUES ('Test Entry 2'); 