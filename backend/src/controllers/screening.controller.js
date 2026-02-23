const screeningService = require('../services/screening.service');
const HttpError = require('../utils/httpError');

async function createScreening(req, res) {
  const screening = await screeningService.createScreening(req.body);
  res.status(201).json({ message: 'Screening saved', data: screening });
}

async function getScreening(req, res) {
  const { id } = req.params;
  const screening = await screeningService.getScreeningById(id);
  if (!screening) {
    throw new HttpError(404, 'Screening not found');
  }
  res.json({ data: screening });
}

async function listScreenings(req, res) {
  const { userId } = req.params;
  const requestingUser = req.user;

  if (
    !requestingUser ||
    (Number(userId) !== Number(requestingUser.id) &&
      !['doctor', 'admin'].includes(requestingUser.role))
  ) {
    throw new HttpError(403, 'Not authorised to view these screenings');
  }

  const screenings = await screeningService.listScreeningsByUser(userId);
  res.json({ data: screenings });
}

async function listAllScreenings(req, res) {
  const requestingUser = req.user;
  if (!requestingUser || !['doctor', 'admin'].includes(requestingUser.role)) {
    throw new HttpError(403, 'Not authorised');
  }
  const screenings = await screeningService.listAllScreenings();
  res.json({ data: screenings });
}

module.exports = {
  createScreening,
  getScreening,
  listScreenings,
  listAllScreenings,
};
