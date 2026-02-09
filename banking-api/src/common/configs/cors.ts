const corsOptions = {
  origin: 'http://localhost:8080/', // allow this origin to access the server
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

export default corsOptions;
