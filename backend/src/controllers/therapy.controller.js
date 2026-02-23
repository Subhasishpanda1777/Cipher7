const therapyService = require('../services/therapy.service');

async function createSession(req, res) {
  const session = await therapyService.createTherapySession({
    user: req.user,
    payload: req.body,
  });
  res.status(201).json({ message: 'Therapy session recorded', data: session });
}

async function listMySessions(req, res) {
  const sessions = await therapyService.listSessionsByUser(req.user.id);
  res.json({ data: sessions });
}

async function listChildSessions(req, res) {
  const { childId } = req.params;
  const sessions = await therapyService.listSessionsByChild(childId, req.user);
  res.json({ data: sessions });
}

async function listAllSessions(req, res) {
  if (!['doctor', 'admin'].includes(req.user.role)) {
    throw new Error('Not authorised');
  }
  const sessions = await therapyService.listAllSessions();
  res.json({ data: sessions });
}

module.exports = {
  createSession,
  listMySessions,
  listChildSessions,
  listAllSessions,
};
