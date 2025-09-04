// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString:
    "postgresql://postgres:APEapeape9989@localhost:5432/question_answer_platform",
});

connectionPool
export default connectionPool;