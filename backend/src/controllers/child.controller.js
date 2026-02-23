const childService = require('../services/child.service');
const HttpError = require('../utils/httpError');

async function listMyChildren(req, res) {
  const children = await childService.listChildrenByUser(req.user.id);
  res.json({ data: children });
}

async function listAllChildren(req, res) {
  if (!['doctor', 'admin'].includes(req.user.role)) {
    throw new HttpError(403, 'Not authorised');
  }
  const children = await childService.listAllChildren();
  res.json({ data: children });
}

module.exports = {
  listMyChildren,
  listAllChildren,
};
