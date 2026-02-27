import HttpStatusCode from '../constants/http-status-code';

const corsOptions = {
  origin: 'http://localhost:5173', // allow this origin to access the server
  optionsSuccessStatus: HttpStatusCode.OK, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

export default corsOptions;
