import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import { question_IdCheck, validateQuestion } from "../middlewares/questionsValidation.mjs";


const questionRouter = Router();

questionRouter.post("/",validateQuestion, async (req, res) => {
    const {title, description, category} = req.body;
    try{
        await connectionPool.query(
            `INSERT INTO questions(title, description, category)
      VALUES($1, $2, $3)`,
            [
              title,
              description,
              category,
            ]
        )
    }catch(error){
        console.log("DB post questions error", error);
        return res.status(500).json({
            message: "Unable to create question.",
          });
    }
    return res.status(201).json({
        message: "Question created successfully",
    });
});

questionRouter.get("/", async (req, res) => {
    let results;
    try {
      results = await connectionPool.query("SELECT * FROM questions");
    } catch {
      return res.status(500).json({
        message: "Unable to fetch questions",
      });
    }
    return res.status(200).json({
      data: results.rows, 
    });
  })

questionRouter.get("/search", async (req, res) => {
    const { title, category } = req.query;
  
    if (!title && !category) {
      return res.status(400).json({ message: "Invalid search parameters." });
    }
  
    let query = "SELECT * FROM questions WHERE 1=1";
    const values = [];
  
    if (title) {
      values.push(`%${title}%`);
      query += ` AND title ILIKE $${values.length}`;
    }
  
    if (category) {
      values.push(`%${category}%`);
      query += ` AND category ILIKE $${values.length}`;
    }
  
    let results;
    try {
      results = await connectionPool.query(query, values);
    } catch (error) {
      console.log("DB search questions error", error);
      return res.status(500).json({ message: "Unable to fetch questions." });
    }
  
    if (results.rows.length === 0) {
      return res.status(404).json({ message: "No questions found." });
    }
  
    return res.status(200).json({ data: results.rows });
  });

questionRouter.get("/:id", async (req, res) => {
    const questionId = req.params.id;
    let results;
    try{
        results = await connectionPool.query("SELECT * FROM questions WHERE id = $1", [questionId]);
        if(results.rows.length === 0){
            return res.status(404).json({
                message: "Question not found.",
              });
        }
    }catch(error){
        console.log("DB get question by id error", error);
        return res.status(500).json({
            message: "Unable to fetch question.",
          });
    }
    return res.status(200).json({
        data: results.rows[0],
    });
});

questionRouter.put("/:id", async (req, res) => {
    const assignmentId = req.params.id;
    const { title,description, category} = req.body;

  let results;
  try {
      results = await connectionPool.query(
      `UPDATE questions
      set title=$2, description=$3, category=$4
      WHERE id=$1 RETURNING *`,
      [
        assignmentId,
        title,
        description,
        category
      ]
    )
  }catch (error) {
    console.log("DB update question by id error", error); 
    return res.status(500).json({
      message: "Unable to fetch questions.",
    });
  }
  if (!results.rows[0]) {
    return res.status(404).json({
      message: "Question not found.",
    });
  }
  return res.status(200).json({
    message: "Question updated successfully",
  });
});

questionRouter.delete("/:id", async (req, res) => {
    const questionId = req.params.id;
    let results
    try{
        results = await connectionPool.query("DELETE FROM questions WHERE id = $1 RETURNING *", [questionId]);
    }catch(error){
        console.log("DB delete question by id error", error);
        return res.status(500).json({
            message: "Unable to delete question.",
          });
    }
    if(results.rows.length === 0){
        return res.status(404).json({
            message: "Question not found.",
        });
    }
    return res.status(200).json({
        message: "Question post has been deleted successfully.",
    });
});

questionRouter.post("/:id/answers", question_IdCheck, async (req, res) => {
    const questionId = req.questionId;
    const { content } = req.body;
    if(!content){
        return res.status(400).json({
            message: "Invalid request data.",
        });
    }
    if(content.length > 300){
        return res.status(400).json({
            message: "Content exceeds maximum length of 300 characters.",
        });
    }
    let results;
    try{
        results = await connectionPool.query(
            `INSERT INTO answers(question_id, content)
            VALUES($1, $2) RETURNING *`,
            [
              questionId,
              content,
            ]
        )
    }catch(error){
        console.log("DB post answer error", error);
        return res.status(500).json({
            message: "Unable to create answer.",
          });
    }
    return res.status(201).json({
        message: "Answer created successfully",
        data: results.rows[0],
    });
});

questionRouter.get("/:id/answers", question_IdCheck,async (req, res) => {
    const questionId = req.questionId;
    let results;
    try {
      results = await connectionPool.query(
        "SELECT * FROM answers WHERE question_id = $1",
        [questionId]
      );
    }catch (error) {
      console.log("DB get answers by question id error", error);
      return res.status(500).json({
        message: "Unable to fetch answers.",
      });
    }
    return res.status(200).json({
      data: results.rows,
    });
  });

questionRouter.delete("/:id/answers/", question_IdCheck, async (req, res) => {
    const  questionId  = req.questionId;

    let results;
    try {
      results = await connectionPool.query(
        "DELETE FROM answers WHERE question_id = $1 RETURNING *",
        [questionId]
      );
    } catch (error) {
      console.log("DB delete answer by id error", error);
      return res.status(500).json({
        message: "Unable to delete answer.",
      });
    }
    if (results.rows.length === 0) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }
    return res.status(200).json({
      message: "All answers for the question have been deleted successfully.",
    });
});

export default questionRouter;