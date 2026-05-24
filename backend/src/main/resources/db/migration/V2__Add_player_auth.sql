-- 添加唯一索引确保数据完整性
ALTER TABLE players 
ADD UNIQUE INDEX idx_nickname (nickname);

ALTER TABLE players 
ADD INDEX idx_email (email);
