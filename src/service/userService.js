export default {
  list: (req, res) => {
    const users = ['test'];
    if (!users) return res.status(500).json({ msg: 'no users' });
    return res.json(users);
  },
};
