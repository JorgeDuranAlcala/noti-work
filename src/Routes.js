/* eslint-disable import/extensions */
import React, { useEffect } from 'react';
import {
  Route, Switch, BrowserRouter, Redirect,
} from 'react-router-dom';
import OneSignal from 'react-onesignal';
import { logOut } from './actions/LoginAction';
import Login from './views/Login.jsx';
import AddUser from './views/AddUser.jsx';
import PatientList from './views/PatientList.jsx';
import Backup from './views/Backup.jsx';
import UserList from './views/UserList.jsx';
import FormPatient from './views/FormPatient.jsx';
import FormPatientView from './views/FormPatientView.jsx';
// import Appointment from './views/Appointments.jsx';
import AppointmentHistory from './views/AppointmentHistory';
import DocumentPatient from './views/DocumentPatient';
import HistoryDatesFormat from './views/HistoryDatesFormat';
import Appointmentsv2 from './views/Appointmentsv2';

const Logout = () => {
  localStorage.removeItem('unetepediatricatkn');
  logOut()
    .then(() => null)
    .catch(() => null);
  return <Redirect to="/login" />;
};

const Notfound = () => <h1>Ruta no encontrada 404</h1>;

const Routes = () => {
  useEffect(() => {
    OneSignal.init({
      appId: process.env.REACT_APP_ONE_SIGNAL_APP_ID,
      autoResubscribe: true,
      allowLocalhostAsSecureOrigin: true,
      autoRegister: true,
      safari_web_id: process.env.REACT_APP_ONE_SIGNAL_SAFARI_API,
      persistNotification: true,
    });
  });
  return (
    <BrowserRouter>
      <Switch>
        <Redirect exact from="/" to="/login" />
        <Route exact path="/usuarios" component={UserList} />
        <Route exact path="/usuarios/agregarusuario" component={AddUser} />
        <Route exact path="/pacientes" component={PatientList} />
        <Route
          exact
          path="/pacientes/formato/:action/:id"
          component={FormPatient}
        />
        <Route exact path="/pacientes/ver/:id" component={FormPatientView} />
        <Route
          exact
          path="/pacientes/citas/:id"
          component={AppointmentHistory}
        />
        <Route exact path="/pacientes/oficio/:id" component={DocumentPatient} />
        <Route
          exact
          path="/pacientes/formato-citas/:id"
          component={HistoryDatesFormat}
        />
        {/* <Route exact path="/citas" component={Appointment} /> */}
        <Route exact path="/citas/:id" component={Appointmentsv2} />
        <Route exact path="/descargas" component={Backup} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/logout" component={Logout} />
        <Route path="*" component={Notfound} />
      </Switch>
    </BrowserRouter>
  );
};

export default Routes;
