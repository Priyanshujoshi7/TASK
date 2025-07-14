const express = require('express');
const bodyParser = require('body-parser');
const boardsRoutes = require('./routes/boards');
const columnsRoutes = require('./routes/columns');
const tasksRoutes = require('./routes/tasks');

const app = express();
app.use(bodyParser.json());
app.use('/boards', boardsRoutes);
app.use('/columns', columnsRoutes);
app.use('/tasks', tasksRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(Server running on port ${PORT}));
