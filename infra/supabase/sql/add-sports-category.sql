-- Add '体育' category
INSERT INTO categories (name)
VALUES ('体育')
ON CONFLICT (name) DO NOTHING;
