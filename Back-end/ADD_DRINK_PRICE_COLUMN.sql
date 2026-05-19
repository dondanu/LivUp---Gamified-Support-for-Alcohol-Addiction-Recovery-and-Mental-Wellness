-- Add drink_price column to drink_logs table
-- This will store the actual price user spent on drinks each day
-- Default is 0.00 (if no drinks, no money spent)
-- Currency: Sri Lankan Rupees (RS)

ALTER TABLE drink_logs 
ADD COLUMN drink_price DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Price of drinks in Sri Lankan Rupees';

-- Update existing records to have default price based on drink count
-- Assumption: Average drink price = RS 500 per drink
UPDATE drink_logs 
SET drink_price = drink_count * 500 
WHERE drink_price = 0.00 AND drink_count > 0;

-- Verify the changes
SELECT id, user_id, drink_count, drink_price, log_date 
FROM drink_logs 
ORDER BY log_date DESC 
LIMIT 10;
