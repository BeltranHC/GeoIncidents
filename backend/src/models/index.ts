// Exportar todos los modelos
import User from './User';
import Category from './Category';
import Incident from './Incident';
import Evidence from './Evidence';
import Notification from './Notification';
import RiskZone from './RiskZone';
import Prediction from './Prediction';

// Configurar asociaciones adicionales
User.hasMany(Incident, { foreignKey: 'userId', as: 'incidents' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

Category.hasMany(Incident, { foreignKey: 'categoryId', as: 'incidents' });

Incident.hasMany(Evidence, { foreignKey: 'incidentId', as: 'evidences' });

RiskZone.hasMany(Prediction, { foreignKey: 'zoneId', as: 'predictions' });

export {
  User,
  Category,
  Incident,
  Evidence,
  Notification,
  RiskZone,
  Prediction,
};

export default {
  User,
  Category,
  Incident,
  Evidence,
  Notification,
  RiskZone,
  Prediction,
};
