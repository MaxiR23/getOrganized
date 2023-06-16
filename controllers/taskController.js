import Project from "../models/Projects.js";
import Task from "../models/Tasks.js";

const addTask = async (req, res) => {
    const { project } = req.body;

    const projectExist = await Project.findById(project)

    if (!projectExist) {
        const error = new Error('Proyecto no existe');
        return res.status(404).json({ msg: error.message })
    }

    if (projectExist.creator.toString() !== req.user._id.toString()) {
        const error = new Error('No tienes los permisos para añadir tareas');
        return res.status(403).json({ msg: error.message })
    }

    try {
        const storedTask = await Task.create(req.body);
        //Almaceno el ID en el proyecto
        projectExist.tasks.push(storedTask._id); /* permanece en memoria */
        await projectExist.save(); /* guarda el cambio */
        res.json(storedTask);
    } catch (error) {
        console.warn(error)
    }
};

const getTask = async (req, res) => {
    const { id } = req.params;
    /* verificamos la tarea */
    const task = await Task.findById(id).populate('project'); /* cruza la info con lo que tenemos en proyecto */
    /* controlamos que la tarea existe */
    if (!task) {
        const error = new Error('Tarea no encontrada');
        return res.status(404).json({ msg: error.message })
    }
    /* controlamos si es el dueño de la tarea el que require estos datos */
    if (task.project.creator.toString() !== req.user._id.toString()) {
        const error = new Error('Acción no válida');
        return res.status(403).json({ msg: error.message })
    }

    res.json(task)
};

const updateTask = async (req, res) => {
    const { id } = req.params;

    const task = await Task.findById(id).populate('project'); /* cruza la info con lo que tenemos en proyecto */

    if (!task) {
        const error = new Error('Tarea no encontrada');
        return res.status(404).json({ msg: error.message })
    }

    if (task.project.creator.toString() !== req.user._id.toString()) {
        const error = new Error('Acción no válida');
        return res.status(403).json({ msg: error.message })
    }

    /* asignamos las tareas que vienen desde un form O le asignamos la que ya tenia en la base de datos */
    task.name = req.body.name || task.name;
    task.description = req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.project_delivery_date = req.body.project_delivery_date || task.project_delivery_date;

    try {
        const storedTask = await task.save();
        res.json(storedTask);
    } catch (error) {
        console.warn(error);
    }
};

const deleteTask = async (req, res) => {
    const { id } = req.params;

    const task = await Task.findById(id).populate('project'); /* cruza la info con lo que tenemos en proyecto */

    if (!task) {
        const error = new Error('Tarea no encontrada');
        return res.status(404).json({ msg: error.message })
    }

    if (task.project.creator.toString() !== req.user._id.toString()) {
        const error = new Error('Acción no válida');
        return res.status(403).json({ msg: error.message })
    }

    try {
        const project = await Project.findById(task.project)
        project.tasks.pull(task._id);
        /* podemos ordenar por cual promesa queremos que se ejecute primero */
        await Promise.allSettled([await project.save(), await task.deleteOne()])
        res.json({ msg: 'La tarea se eliminó.' })
    } catch (error) {
        console.warn(error);
    }
};

const changeTaskStatus = async (req, res) => {
    const { id } = req.params;

    const task = await Task.findById(id).populate('project');

    if (!task) {
        const error = new Error('Tarea no encontrada');
        return res.status(404).json({ msg: error.message })
    }

    if (task.project.creator.toString() !== req.user._id.toString() &&
        !task.project.collabs.some(
            (collab) => collab._id.toString() === req.user._id.toString()
        )) {
        const error = new Error('Acción no válida');
        return res.status(403).json({ msg: error.message })
    }

    task.status = !task.status;
    task.completedBy = req.user._id;
    await task.save();

    const storedTask = await Task.findById(id).populate('project').populate('completedBy');
    res.json(storedTask);
};

export {
    addTask,
    getTask,
    updateTask,
    deleteTask,
    changeTaskStatus
}