import HttpStatusCode from '../constants/http-status-code';
import environmentConfig from './environment';

const corsOptions = {
  origin: environmentConfig.corsOrigin, // allow this origin to access the server
  optionsSuccessStatus: HttpStatusCode.OK, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

export default corsOptions;
