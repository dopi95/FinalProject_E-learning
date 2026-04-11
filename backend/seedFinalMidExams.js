require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');
const Exam = require('./models/Exam');
const User = require('./models/User');

// Mid: 20 questions × 1 mark = 20 total | Final: 50 questions × 1 mark = 50 total
const buildMidQuestions = (prefix) => [
  // MCQ (10)
  { question: `${prefix}: What does DBMS stand for?`, type: 'mcq', options: ['Database Management System', 'Data Backup Management System', 'Digital Base Management System', 'None'], correctAnswer: 'Database Management System', marks: 1 },
  { question: `${prefix}: Which of the following is a relational DBMS?`, type: 'mcq', options: ['MongoDB', 'MySQL', 'Redis', 'Cassandra'], correctAnswer: 'MySQL', marks: 1 },
  { question: `${prefix}: Which normal form eliminates partial dependencies?`, type: 'mcq', options: ['1NF', '2NF', '3NF', 'BCNF'], correctAnswer: '2NF', marks: 1 },
  { question: `${prefix}: Which SQL clause filters records?`, type: 'mcq', options: ['ORDER BY', 'GROUP BY', 'WHERE', 'HAVING'], correctAnswer: 'WHERE', marks: 1 },
  { question: `${prefix}: Which JOIN returns all rows from both tables?`, type: 'mcq', options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'], correctAnswer: 'FULL OUTER JOIN', marks: 1 },
  { question: `${prefix}: Which command removes a table permanently?`, type: 'mcq', options: ['DELETE', 'DROP', 'TRUNCATE', 'REMOVE'], correctAnswer: 'DROP', marks: 1 },
  { question: `${prefix}: Which aggregate function counts rows?`, type: 'mcq', options: ['SUM', 'AVG', 'COUNT', 'MAX'], correctAnswer: 'COUNT', marks: 1 },
  { question: `${prefix}: Which constraint ensures unique values?`, type: 'mcq', options: ['NOT NULL', 'CHECK', 'UNIQUE', 'DEFAULT'], correctAnswer: 'UNIQUE', marks: 1 },
  { question: `${prefix}: Which SQL statement modifies existing records?`, type: 'mcq', options: ['INSERT', 'UPDATE', 'ALTER', 'MODIFY'], correctAnswer: 'UPDATE', marks: 1 },
  { question: `${prefix}: What does DDL stand for?`, type: 'mcq', options: ['Data Definition Language', 'Data Display Language', 'Dynamic Data Language', 'None'], correctAnswer: 'Data Definition Language', marks: 1 },
  // TRUE-FALSE (5)
  { question: `${prefix}: SQL stands for Structured Query Language.`, type: 'true-false', options: ['True', 'False'], correctAnswer: 'True', marks: 1 },
  { question: `${prefix}: A primary key can contain NULL values.`, type: 'true-false', options: ['True', 'False'], correctAnswer: 'False', marks: 1 },
  { question: `${prefix}: ACID stands for Atomicity, Consistency, Isolation, and Durability.`, type: 'true-false', options: ['True', 'False'], correctAnswer: 'True', marks: 1 },
  { question: `${prefix}: A table can have multiple foreign keys.`, type: 'true-false', options: ['True', 'False'], correctAnswer: 'True', marks: 1 },
  { question: `${prefix}: The WHERE clause is executed before GROUP BY.`, type: 'true-false', options: ['True', 'False'], correctAnswer: 'True', marks: 1 },
  // FILL-BLANK (5)
  { question: `${prefix}: The _____ command is used to retrieve data from a database.`, type: 'fill-blank', options: [], correctAnswer: 'SELECT', marks: 1 },
  { question: `${prefix}: A foreign key references the _____ key of another table.`, type: 'fill-blank', options: [], correctAnswer: 'primary', marks: 1 },
  { question: `${prefix}: _____ is the process of organizing data to reduce redundancy.`, type: 'fill-blank', options: [], correctAnswer: 'Normalization', marks: 1 },
  { question: `${prefix}: The _____ function returns the highest value in a column.`, type: 'fill-blank', options: [], correctAnswer: 'MAX', marks: 1 },
  { question: `${prefix}: _____ ensures changes are permanent after commit.`, type: 'fill-blank', options: [], correctAnswer: 'Durability', marks: 1 },
];

const buildFinalQuestions = (prefix) => [
  // MCQ (25)
  { question: `${prefix}: What does DBMS stand for?`, type: 'mcq', options: ['Database Management System', 'Data Backup Management System', 'Digital Base Management System', 'None'], correctAnswer: 'Database Management System', marks: 1 },
  { question: `${prefix}: Which of the following is a relational DBMS?`, type: 'mcq', options: ['MongoDB', 'MySQL', 'Redis', 'Cassandra'], correctAnswer: 'MySQL', marks: 1 },
  { question: `${prefix}: Which normal form eliminates partial dependencies?`, type: 'mcq', options: ['1NF', '2NF', '3NF', 'BCNF'], correctAnswer: '2NF', marks: 1 },
  { question: `${prefix}: Which SQL clause filters records?`, type: 'mcq', options: ['ORDER BY', 'GROUP BY', 'WHERE', 'HAVING'], correctAnswer: 'WHERE', marks: 1 },
  { question: `${prefix}: Which JOIN returns all rows from both tables?`, type: 'mcq', options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'], correctAnswer: 'FULL OUTER JOIN', marks: 1 },
  { question: `${prefix}: Which command removes a table and its data permanently?`, type: 'mcq', options: ['DELETE', 'DROP', 'TRUNCATE', 'REMOVE'], correctAnswer: 'DROP', marks: 1 },
  { question: `${prefix}: Which aggregate function returns the number of rows?`, type: 'mcq', options: ['SUM', 'AVG', 'COUNT', 'MAX'], correctAnswer: 'COUNT', marks: 1 },
  { question: `${prefix}: Which constraint ensures unique values in a column?`, type: 'mcq', options: ['NOT NULL', 'CHECK', 'UNIQUE', 'DEFAULT'], correctAnswer: 'UNIQUE', marks: 1 },
  { question: `${prefix}: What is the result of a Cartesian product in SQL?`, type: 'mcq', options: ['Intersection of two tables', 'Union of two tables', 'All combinations of rows from both tables', 'Difference of two tables'], correctAnswer: 'All combinations of rows from both tables', marks: 1 },
  { question: `${prefix}: Which SQL statement is used to modify existing records?`, type: 'mcq', options: ['INSERT', 'UPDATE', 'ALTER', 'MODIFY'], correctAnswer: 'UPDATE', marks: 1 },
  { question: `${prefix}: Which keyword sorts results in descending order?`, type: 'mcq', options: ['ASC', 'DESC', 'ORDER', 'SORT'], correctAnswer: 'DESC', marks: 1 },
  { question: `${prefix}: Which type of key uniquely identifies each record?`, type: 'mcq', options: ['Foreign Key', 'Candidate Key', 'Primary Key', 'Super Key'], correctAnswer: 'Primary Key', marks: 1 },
  { question: `${prefix}: Which SQL function returns the current date?`, type: 'mcq', options: ['NOW()', 'GETDATE()', 'CURDATE()', 'TODAY()'], correctAnswer: 'CURDATE()', marks: 1 },
  { question: `${prefix}: What does DDL stand for?`, type: 'mcq', options: ['Data Definition Language', 'Data Display Language', 'Dynamic Data Language', 'None'], correctAnswer: 'Data Definition Language', marks: 1 },
  { question: `${prefix}: Which clause filters groups in GROUP BY?`, type: 'mcq', options: ['WHERE', 'HAVING', 'FILTER', 'LIMIT'], correctAnswer: 'HAVING', marks: 1 },
  { question: `${prefix}: Which normal form removes transitive dependencies?`, type: 'mcq', options: ['1NF', '2NF', '3NF', '4NF'], correctAnswer: '3NF', marks: 1 },
  { question: `${prefix}: Which SQL command grants privileges to a user?`, type: 'mcq', options: ['ALLOW', 'PERMIT', 'GRANT', 'ASSIGN'], correctAnswer: 'GRANT', marks: 1 },
  { question: `${prefix}: What is a view in SQL?`, type: 'mcq', options: ['A stored procedure', 'A virtual table based on a query', 'An index', 'A trigger'], correctAnswer: 'A virtual table based on a query', marks: 1 },
  { question: `${prefix}: Which isolation level prevents dirty reads?`, type: 'mcq', options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'], correctAnswer: 'Read Committed', marks: 1 },
  { question: `${prefix}: Which command undoes a transaction?`, type: 'mcq', options: ['COMMIT', 'ROLLBACK', 'SAVEPOINT', 'UNDO'], correctAnswer: 'ROLLBACK', marks: 1 },
  { question: `${prefix}: Which SQL command removes privileges from a user?`, type: 'mcq', options: ['DENY', 'REVOKE', 'REMOVE', 'DELETE'], correctAnswer: 'REVOKE', marks: 1 },
  { question: `${prefix}: Which type of relationship uses a junction table?`, type: 'mcq', options: ['One-to-One', 'One-to-Many', 'Many-to-Many', 'Self-referencing'], correctAnswer: 'Many-to-Many', marks: 1 },
  { question: `${prefix}: Which SQL clause limits the number of returned rows?`, type: 'mcq', options: ['TOP', 'LIMIT', 'ROWNUM', 'FETCH'], correctAnswer: 'LIMIT', marks: 1 },
  { question: `${prefix}: What does ER stand for in ER diagram?`, type: 'mcq', options: ['Entity Relationship', 'Entity Record', 'Element Relation', 'None'], correctAnswer: 'Entity Relationship', marks: 1 },
  { question: `${prefix}: Which command saves a transaction permanently?`, type: 'mcq', options: ['SAVE', 'COMMIT', 'ROLLBACK', 'END'], correctAnswer: 'COMMIT', marks: 1 },

  // TRUE-FALSE (15)
  { question: `${prefix}: SQL stands for Structured Query Language.`, type: 'true-false', options: ['True', 'False'], correctAnswer: 'True', marks: 1 },
  { question: `${prefix}: A primary key can contain NULL values.`, type: 'true-false', options: ['True', 'False'], correctAnswer: 'False', marks: 1 },
  { question: `${prefix}: ACID stands for Atomicity, Consistency, Isolation, and Durability.`, type: 'true-false', options: ['True', 'False'], correctAnswer: 'True', marks: 1 },
  { question: `${prefix}: A foreign key can reference a non-primary key column.`, type: 'true-false', options: ['True', 'False'], correctAnswer: 'False', marks: 1 },
  { question: `${prefix}: The TRUNCATE command can be rolled back in all databases.`, type: 'true-false', options: ['True', 'False'], correctAnswer: 'False', marks: 1 },
  { question: `${prefix}: An index always speeds up SELECT queries.`, type: 'true-false', options: ['True', 'False'], correctAnswer: 'False', marks: 1 },
  { question: `${prefix}: A table can have multiple foreign keys.`, type: 'true-false', options: ['True', 'False'], correctAnswer: 'True', marks: 1 },
  { question: `${prefix}: NoSQL databases always use tables to store data.`, type: 'true-false', options: ['True', 'False'], correctAnswer: 'False', marks: 1 },
  { question: `${prefix}: The WHERE clause is executed before GROUP BY.`, type: 'true-false', options: ['True', 'False'], correctAnswer: 'True', marks: 1 },
  { question: `${prefix}: A subquery can appear in the SELECT clause.`, type: 'true-false', options: ['True', 'False'], correctAnswer: 'True', marks: 1 },
  { question: `${prefix}: DML stands for Data Manipulation Language.`, type: 'true-false', options: ['True', 'False'], correctAnswer: 'True', marks: 1 },
  { question: `${prefix}: A composite key is made up of two or more columns.`, type: 'true-false', options: ['True', 'False'], correctAnswer: 'True', marks: 1 },
  { question: `${prefix}: The HAVING clause can be used without GROUP BY.`, type: 'true-false', options: ['True', 'False'], correctAnswer: 'False', marks: 1 },
  { question: `${prefix}: Normalization always improves query performance.`, type: 'true-false', options: ['True', 'False'], correctAnswer: 'False', marks: 1 },
  { question: `${prefix}: A stored procedure is precompiled and stored in the database.`, type: 'true-false', options: ['True', 'False'], correctAnswer: 'True', marks: 1 },

  // FILL-BLANK (10)
  { question: `${prefix}: The _____ command is used to retrieve data from a database.`, type: 'fill-blank', options: [], correctAnswer: 'SELECT', marks: 1 },
  { question: `${prefix}: A foreign key references the _____ key of another table.`, type: 'fill-blank', options: [], correctAnswer: 'primary', marks: 1 },
  { question: `${prefix}: The _____ clause combines rows from two or more tables.`, type: 'fill-blank', options: [], correctAnswer: 'JOIN', marks: 1 },
  { question: `${prefix}: _____ is the process of organizing data to reduce redundancy.`, type: 'fill-blank', options: [], correctAnswer: 'Normalization', marks: 1 },
  { question: `${prefix}: The _____ command adds new records to a table.`, type: 'fill-blank', options: [], correctAnswer: 'INSERT', marks: 1 },
  { question: `${prefix}: The _____ function returns the highest value in a column.`, type: 'fill-blank', options: [], correctAnswer: 'MAX', marks: 1 },
  { question: `${prefix}: _____ ensures changes are permanent after commit.`, type: 'fill-blank', options: [], correctAnswer: 'Durability', marks: 1 },
  { question: `${prefix}: The _____ statement is used to create a new table.`, type: 'fill-blank', options: [], correctAnswer: 'CREATE TABLE', marks: 1 },
  { question: `${prefix}: An _____ is a database object that speeds up data retrieval.`, type: 'fill-blank', options: [], correctAnswer: 'index', marks: 1 },
  { question: `${prefix}: The _____ operator searches for a pattern in a column.`, type: 'fill-blank', options: [], correctAnswer: 'LIKE', marks: 1 },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  const course = await Course.findOne({ title: /database management/i });
  if (!course) return console.error('Course not found.') || process.exit(1);

  const instructor = await User.findById(course.instructor);
  if (!instructor) return console.error('Instructor not found.') || process.exit(1);

  const now = new Date();
  const exams = [
    {
      title: 'Mid Exam',
      duration: 60,
      totalMarks: 20,
      passingMarks: 10,
      startDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 2),
      instructions: 'Answer all 20 questions carefully. No cheating is allowed.',
      questions: buildMidQuestions('Mid Exam'),
    },
    {
      title: 'Final Exam',
      duration: 120,
      totalMarks: 50,
      passingMarks: 25,
      startDate: new Date(now.getFullYear(), now.getMonth() + 3, 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 3, 2),
      instructions: 'Answer all 50 questions carefully. This is the final examination.',
      questions: buildFinalQuestions('Final Exam'),
    },
  ];

  for (const examData of exams) {
    const existing = await Exam.findOne({ title: examData.title, course: course._id });
    if (existing) {
      console.log(`⚠️  "${examData.title}" already exists — skipping.`);
      continue;
    }

    const exam = await Exam.create({
      ...examData,
      course: course._id,
      instructor: instructor._id,
      showResults: false,
      status: 'draft',
    });

    console.log(`✅ "${exam.title}" created — ${exam.questions.length} questions, totalMarks: ${exam.totalMarks}, status: draft`);
  }

  console.log('Done.');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
