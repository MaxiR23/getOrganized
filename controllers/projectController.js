import Project from "../models/Projects.js"
import Task from "../models/Tasks.js";
import User from "../models/User.js";

const newProject = async (req, res) => {
    const project = new Project(req.body);
    project.creator = req.user._id;

    try {
        const storedProject = await project.save();
        res.json(storedProject);
    } catch (error) {
        console.warn(error)
    }
}

const getProjects = async (req, res) => {
    /* no traemos todo menos las tareas ya que no son necesarias */

    /* usamos or porque puede ser colaborador o creador */
    const project = await Project.find({
        '$or' : [
            {'collabs' : {$in: req.user}},  
            {'creator' : {$in: req.user}}  
        ]
    })
    .select('-tasks'); /* traera todos los projectos almacenados en la db por el usuario */
    
    res.json(project);
}

const getProject = async (req, res) => {
    const { id } = req.params;
    const project = await Project.findById(id)
    .populate({path: 'tasks', populate: {path: 'completedBy', select: 'name'}})
    .populate('collabs', "name email"); /* traemos los campos que requerimos */

    if (!project) {
        const error = new Error('No encontrado');
        return res.status(404).json({ msg: error.message })
    }

    /* si el usuario no es el creador o colaborador no dejamos entrar al proyecto */
    if (project.creator.toString() !== req.user._id.toString() && !project.collabs.some(collab => collab._id.toString() === req.user._id.toString())) {
        const error = new Error('Acción no valida.');
        return res.status(401).json({ msg: error.message })
    }
    
    res.json(project)
}

const editProject = async (req, res) => {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
        const error = new Error('Proyecto no encontrado.');
        return res.status(404).json({ msg: error.message })
    }

    /* si el usuario no es el creador o colaborador no dejamos entrar al proyecto */
    if (project.creator.toString() !== req.user._id.toString()) {
        const error = new Error('Acción no valida.');
        return res.status(401).json({ msg: error.message })
    }

    /* asignamos lo que manda el usuario o dejamos tal cual estaba en la base de datos */
    project.name = req.body.name || project.name;
    project.description = req.body.description || project.description;
    project.project_delivery_date = req.body.project_delivery_date || project.project_delivery_date;
    project.client = req.body.client || project.client;

    try {
        const storedProject = await project.save()
        return res.json(storedProject);
    } catch (error) {
        console.warn(error)
    }
}

const deleteProject = async (req, res) => {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
        const error = new Error('Proyecto no encontrado.');
        return res.status(404).json({ msg: error.message })
    }

    /* si el usuario no es el creador o colaborador no dejamos entrar al proyecto */
    if (project.creator.toString() !== req.user._id.toString()) {
        const error = new Error('Acción no valida.');
        return res.status(401).json({ msg: error.message })
    }

    try {
        await project.deleteOne();
        res.json({ msg: 'Proyecto eliminado' })
    } catch (error) {
        console.warn(error);
    }
}

const searchCollab = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({email}).select('-password -createdAt -updatedAt -token -__v -isVerified');

    if (!user) {
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({msg: error.message});
    }

    res.json(user)
}

const addCollabs = async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        const error = new Error('Proyecto no encontrado');
        return res.status(404).json({msg: error.message});
    }

    if (project.creator.toString() !== req.user._id.toString()) {
        const error = new Error('Accion no valida');
        return res.status(404).json({msg: error.message});
    }

    const { email } = req.body;
    const user = await User.findOne({email}).select('-password -createdAt -updatedAt -token -__v -isVerified');

    if (!user) {
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({msg: error.message});
    }

    //El colaborador no es el admin del proyecto
    if (project.creator.toString() === user._id.toString()) {
        const error = new Error('El creador del proyecto no puede ser colaborador');
        return res.status(404).json({msg: error.message});
    }

    //Reviso que no este agregado al proyecto
    if (project.collabs.includes(user._id)) {
        const error = new Error('El usuario ya pertenece al proyecto');
        return res.status(404).json({msg: error.message});
    }

    //Si salió todo bien.
    project.collabs.push(user._id)
    await project.save()
    res.json({msg: 'Colaborador agregado correctamente'})
}

const deleteCollabs = async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        const error = new Error('Proyecto no encontrado');
        return res.status(404).json({msg: error.message});
    }

    if (project.creator.toString() !== req.user._id.toString()) {
        const error = new Error('Accion no valida');
        return res.status(404).json({msg: error.message});
    }

    const { email } = req.body;

    //Si salió todo bien.
    project.collabs.pull(req.body.id)
    await project.save()
    res.json({msg: 'Colaborador eliminado correctamente'})
}

export {
    newProject,
    getProject,
    getProjects,
    deleteProject,
    editProject,
    deleteCollabs,
    addCollabs,
    searchCollab
}