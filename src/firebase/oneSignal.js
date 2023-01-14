/* eslint-disable no-async-promise-executor */
import OneSignal from 'react-onesignal';
import axios from 'axios';
import { getAdmins, getUserById } from '../actions/UserAction';

let playerID = '';
export const getPlayerId = () => {
  return new Promise(async (resolve, reject) => {
    await OneSignal.getUserId()
      .then((data) => {
        playerID = data;
        resolve(playerID);
      })
      .catch(() => reject('error'));
  });
};

export const sendNotificationCreate = (userId, patientName, type) => {
  OneSignal.setExternalUserId();
  let text = 'Han cambiado tus horarios, entra para verificar.';
  return new Promise((resolve, reject) => {
    getUserById(userId)
      .then((userData) => {
        const { username } = userData.data;
        const user = userData.data;
        let arrayKeys = [];
        if (user?.oneSignalKeys) {
          const oneSignalKeys = Object.values(user.oneSignalKeys);
          arrayKeys = oneSignalKeys.map((item) => item.key);
          switch (type) {
            case 'date':
              text = `${username}, tienes una nueva cita con el paciente ${patientName}.`;
              break;
            case 'redate':
              text = `${username}, el horario de tu cita ha cambiado.`;
              break;
            case 'deleteDate':
              text = `${username}, una de tus citas se ha eliminado`;
              break;
            case 'reservation':
              text = `El usuario ${username} ha reservado un nuevo horario.`;
              break;
            default:
              break;
          }
          console.log('send notification to doctor');
          console.log(arrayKeys);
          // oneSignalApi.createNotification(text)
          axios
            .post(
              'https://onesignal.com/api/v1/notifications',
              {
                app_id: process.env.REACT_APP_ONE_SIGNAL_APP_ID,
                contents: {
                  en: text,
                  es: text,
                },
                headings: {
                  en: 'Entra a tu cuenta para verificar.',
                  es: 'Entra a tu cuenta para verificar.',
                },
                include_player_ids: arrayKeys,
              },
              {
                headers: {
                  Authorization: `Basic ${process.env.REACT_APP_ONE_SIGNAL_API_REST}`,
                },
              },
            )
            .then(() => {
              console.log('Notification send...');
              resolve();
            })
            .catch((error) => {
              console.log('Notification fail...');
              reject(error);
            });
        }
        resolve();
      })
      .catch(() => null);
  });
};

export const sendNotificationNewPatient = async (patientName) => {
  const text = `Se ha ingresado el nuevo paciente: ${patientName}.`;
  axios
    .post(
      'https://onesignal.com/api/v1/notifications',
      {
        app_id: process.env.REACT_APP_ONE_SIGNAL_APP_ID,
        contents: {
          en: text,
          es: text,
        },
        headings: {
          en: 'Entra a tu cuenta para ver el expediente completo.',
          es: 'Entra a tu cuenta para ver el expediente completo.',
        },
        included_segments: ['Active Users', 'Subscribed Users'],
      },
      {
        headers: {
          Authorization: `Basic ${process.env.REACT_APP_ONE_SIGNAL_API_REST}`,
        },
      },
    )
    .then(() => console.log('Notification send...'))
    .catch((error) => console.log('Notification fail...', error));
};

export const sendNotificationToAdmins = async (userId, patientName, type) => {
  let text = 'Se ha programado una cita. Entra para verificar.';
  const admins = await getAdmins();
  const { username } = await getUserById(userId).then((user) => user.data);
  const arrayKeys = [];

  admins.data.forEach((admin) => {
    if (admin?.oneSignalKeys) {
      const oneSignalKeys = Object.values(admin.oneSignalKeys);
      oneSignalKeys.forEach((item) => {
        const key = item?.key;
        arrayKeys.push(key);
      });
    }
  });

  console.log('admins keys: ');
  console.log(arrayKeys);

  switch (type) {
    case 'date':
      text = `Se ha asignado una nueva cita a ${username} con el paciente ${patientName}`;
      break;
    case 'redate':
      text = '$Se ha cambiado el horario de una cita.';
      break;
    case 'deleteDate':
      text = 'Una de las citas se ha eliminado';
      break;
    case 'reservation':
      text = 'Se ha reservado un nuevo horario.';
      break;
    default:
      break;
  }
  return new Promise((resolve, reject) => {
    if (arrayKeys.length > 0) {
      axios
        .post(
          'https://onesignal.com/api/v1/notifications',
          {
            app_id: process.env.REACT_APP_ONE_SIGNAL_APP_ID,
            contents: {
              en: text,
              es: text,
            },
            headings: {
              en: 'Entra a tu cuenta para verificar.',
              es: 'Entra a tu cuenta para verificar.',
            },
            include_player_ids: arrayKeys,
          },
          {
            headers: {
              Authorization: `Basic ${process.env.REACT_APP_ONE_SIGNAL_API_REST}`,
            },
          },
        )
        .then(() => {
          console.log('Notification send...');
          resolve();
        })
        .catch((error) => {
          console.log('Notification fail...', error);
          reject(error);
        });
    }
    resolve();
  });
};

export const sendReminder = async (userId, frequency, timestamp = 0) => {
  // timestamp = timestamp 12;
  OneSignal.setExternalUserId();
  const text = 'Tu proxima cita es en menos de 15 minutos';
  getUserById(userId)
    .then((userData) => {
      // const { username } = userData.data;
      const user = userData.data;
      let arrayKeys = [];
      if (user?.oneSignalKeys) {
        const oneSignalKeys = Object.values(user.oneSignalKeys);
        arrayKeys = oneSignalKeys.map((item) => item.key);
      }
      return arrayKeys;
    })
    .then((keys) => {
      Promise.all(
        keys.map((key) => {
          const options = {
            method: 'PUT',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              app_id: process.env.REACT_APP_ONE_SIGNAL_APP_ID,
              tags: {
                reminder: timestamp,
                lastCita: 0,
                // lastAppointment:
              },
            }),
          };

          return fetch(`https://onesignal.com/api/v1/players/${key}`, options)
            .then((response) => response.json())
            .catch((err) => console.error(err));
        }),
      )
        .then(() => {
          return axios.post(
            'https://onesignal.com/api/v1/notifications',
            {
              app_id: process.env.REACT_APP_ONE_SIGNAL_APP_ID,
              contents: {
                en: text,
                es: text,
              },
              headings: {
                en: 'Entra a tu cuenta para verificar.',
                es: 'Entra a tu cuenta para verificar.',
              },
              filters: [
                {
                  field: 'tag',
                  key: 'reminder',
                  relation: 'time_elapsed_gt',
                  value: '-900',
                },
              ],
            },
            {
              headers: {
                Authorization: `Basic ${process.env.REACT_APP_ONE_SIGNAL_API_REST}`,
              },
            },
          );
        })
        .then(() => console.log('Notification send...'))
        .catch(() => console.log('Notification fail...'));
    });
};

export const sendMultipleAppoiments = async (id, patientName, type) => {
  sendNotificationCreate(id, patientName, type)
    .then(() => {
      setTimeout(sendNotificationToAdmins, 1000, id, patientName, type);
    });
};
