import connectionPool from "../utils/db.mjs";

export function validateQuestion (req, res, next){
    const {title, description, category} = req.body;
    if(!title || !description || !category){
        return res.status(400).json({
            message: "Invalid question data. Please provide title, description and category.",
          });
    }
    if(description.length < 20 || description.length > 300){
        return res.status(400).json({
            message: "Description must be between 20 and 300 characters.",
          });
    }

    const categoryOptions = ["Geography", "history", "science", "sports", "music", "travelling", "movies", "miscellaneous", "technology", "cuisine", "literature"];
    if(!categoryOptions.includes(category)){
        return res.status(400).json({
            message: "Invalid category. Please provide a valid category.",
          });
      }
    next();
};

export async function question_IdCheck(req, res, next) {
    const questionId = parseInt(req.params.id, 10);

    if (isNaN(questionId)) {
      return res.status(400).json({
        message: "Invalid question id.",
      });
    }

    try {
      const questionCheck = await connectionPool.query(
        "SELECT id FROM questions WHERE id = $1",
        [questionId]
      );
      if (questionCheck.rows.length === 0) {
        return res.status(404).json({
          message: "Question not found.",
        });
      }
      
      req.questionId = questionId;
      next();
    } catch (error) {
      console.log("DB get question by id error", error);
      return res.status(500).json({
        message: "Unable to fetch question.",
      });
    }
  }