var router = require('express').Router();

const { login, signup, updateuser, user , testRoute } = require( '../handlers/userRoutes');
const {create, list, removeDocument, editDocument } = require('../handlers/dataRoutes')


// user endpoints
router.get('/user', user)
router.post('/signup', signup)
router.post('/updateuser', updateuser);
router.post('/login' , login )
router.get('/testRoute', testRoute)
// document manipulation endpoints
router.post('/create', create );
router.post('/list', list )
router.post('/editDocument', editDocument );
router.post('/removeDocument', removeDocument );

module.exports = router ;