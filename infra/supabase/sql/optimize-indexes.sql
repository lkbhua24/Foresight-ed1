-- 优化 predictions 表索引
-- 用于热门页/列表页的分类筛选、状态筛选和排序
CREATE INDEX IF NOT EXISTS idx_predictions_category_status_created 
ON public.predictions (category, status, created_at DESC);

-- 用于仅按时间排序的查询
CREATE INDEX IF NOT EXISTS idx_predictions_created_at_desc 
ON public.predictions (created_at DESC);

-- 用于状态筛选（如仅显示活跃）
CREATE INDEX IF NOT EXISTS idx_predictions_status 
ON public.predictions (status);

-- 优化 event_follows 表索引
-- user_id 和 event_id 已经有唯一约束 (user_id, event_id)，这会自动创建索引支持 user_id 查询
-- 但我们需要单独对 event_id 建立索引，以加速 count(*) 查询（统计关注数）
CREATE INDEX IF NOT EXISTS idx_event_follows_event_id 
ON public.event_follows (event_id);

-- 优化 prediction_outcomes 表索引
-- 详情页加载选项时使用
CREATE INDEX IF NOT EXISTS idx_prediction_outcomes_prediction_id 
ON public.prediction_outcomes (prediction_id);

-- 优化 flag_checkins 表索引
-- 加载 Flag 详情时获取打卡记录
CREATE INDEX IF NOT EXISTS idx_flag_checkins_flag_id_created 
ON public.flag_checkins (flag_id, created_at DESC);

-- 优化 flags 表索引
-- 个人中心加载用户的 Flag
CREATE INDEX IF NOT EXISTS idx_flags_user_id_created 
ON public.flags (user_id, created_at DESC);

-- 优化 orders 表索引 (如果存在)
-- 撮合引擎查询深度: verifying_contract + chain_id + outcome_index + is_buy + price
CREATE INDEX IF NOT EXISTS idx_orders_matching 
ON public.orders (verifying_contract, chain_id, outcome_index, is_buy, price);

-- 优化 event_views 表索引
-- 历史浏览记录查询
CREATE INDEX IF NOT EXISTS idx_event_views_user_id_viewed 
ON public.event_views (user_id, viewed_at DESC);

-- 优化 discussions 表索引 (聊天室)
-- 按 proposal_id (event_id) 加载消息
CREATE INDEX IF NOT EXISTS idx_discussions_proposal_created 
ON public.discussions (proposal_id, created_at);
