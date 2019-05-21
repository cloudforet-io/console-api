export default {

    getApis(obj, req, res) {
       var User = eval(obj);
       User.find((err, objs) => {
            if (err) return res.status(500).send({ error: 'database failure'});
            res.json(objs);
          });
       }
};