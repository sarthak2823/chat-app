const { createGroup, joinGroup, leaveGroup, sendMessages } = require("../controllers/groupControllers");

const router = require("express").Router();

router.post("/creategroup", createGroup);
router.post("/joingroup", joinGroup);
router.post("/leavegroup", leaveGroup);
router.post("/sendmessage", sendMessages);

module.exports = router;