import express from 'express';
import multer from 'multer';
import { createMeeting, deleteMeeting, viewMeetings, viewOneMeeting, updateStatus } from '../controllers/meetingController.js';

const upload = multer();

const meetingRouter = express.Router();

meetingRouter.post('/api/meeting/create',upload.none(), createMeeting);
meetingRouter.post('/api/meeting/delete', deleteMeeting);
meetingRouter.post('/api/meeting/listone', viewOneMeeting);
meetingRouter.post('/api/meeting/status/:id', updateStatus);
meetingRouter.get('/api/meeting/list', viewMeetings);

export default meetingRouter;