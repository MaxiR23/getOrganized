import express from 'express'

import {
    newProject,
    getProject,
    getProjects,
    deleteProject,
    editProject,
    deleteCollabs,
    addCollabs,
    searchCollab
} from '../controllers/projectController.js';

import checkOut from '../middlewares/chechAuth.js';

const router = express.Router();

router.route('/')
    .get(checkOut, getProjects)
    .post(checkOut, newProject)

router.route('/:id')
    .get(checkOut, getProject)
    .put(checkOut, editProject)
    .delete(checkOut, deleteProject)

router.post('/collabs', checkOut, searchCollab);
router.post('/collabs/:id', checkOut, addCollabs);
router.post('/delete-collab/:id', checkOut, deleteCollabs);

export default router;