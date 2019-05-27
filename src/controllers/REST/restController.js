export default {
  postSave(obj, req, res, next) {
    obj.save((err, output) => {
      if (err) {
        console.error(err);
        res.json({
          result: 0,
        });
        return;
      }
      res.json({
        object_id: output.id
      });
    });
  },
  getFind(obj, req, res, next) {
    obj.find((err, objs) => {
      if (err) {
        return res.status(500).send({
          error: 'database failure',
        });
      }
      res.json(objs);
    });
  },
  getFindWith(obj, selector, req, res, next) {
    obj.find(selector, (err, objs) => {
      if (err) {
        return res.status(500).send({
          error: 'database failure',
        });
      }
      res.json(objs);
    });
  },
  getFindOne(obj, selector, req, res, next) {
    obj.findOne(selector, (err, selected) => {
      if (err) {
        return res.status(500).json({
          error: err,
        });
      }
      if (!selected) {
        return res.status(404).json({
          error: 'User not found',
        });
      }
      res.json(selected);
    });
  },
  deleteSingle(obj, selector, req, res, next) {
    obj.deleteOne(selector, (err, objs) => {
      if (err) {
        return res.status(500).json({
          error: 'database failure',
        });
      }
      if (objs.deletedCount === 0) {
        return res.status(404).json({
          error: 'Selected Data has not found',
        });
      }
      res.json({
        message: 'data was successfully deleted',
      });
      res.status(204).end();
    });
  },
  updateSingle(obj, selector, updateObject, req, res, next) {
    obj.findByIdAndUpdate(selector, {
      $set: updateObject,
    }, (err, result) => {
      if (err) {
        console.log(err);
      }
      console.log(`RESULT: ${result}`);
      res.send('Selected Data successfully updated');
    });
  },

};
