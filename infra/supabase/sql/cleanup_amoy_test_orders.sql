-- Cleanup test buy orders on Amoy CLOB market used for testing
-- Market: 0xBec1Fd7e69346aCBa7C15d6E380FcCA993Ea6b02
-- Chain ID: 80002 (Amoy)

UPDATE public.orders
SET status = 'canceled',
    remaining = '0'
WHERE verifying_contract = '0xbec1fd7e69346acba7c15d6e380fcca993ea6b02'
  AND chain_id = 80002
  AND is_buy = TRUE
  AND status IN ('open', 'filled_partial');

