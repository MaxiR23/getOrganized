import mongoose from "mongoose";

const projectsSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    project_delivery_date: {
        type: Date,
        default: Date.now(),
    },
    client: {
        type: String,
        trim: true,
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        }
    ],
    collabs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
    ],
}, {
    timestamps: true
}
);

const Project = mongoose.model('Project', projectsSchema);
export default Project;