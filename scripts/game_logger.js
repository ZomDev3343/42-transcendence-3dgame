function LOG_DEBUG(msg){
	console.log("%c [DEBUG]: %s", 'color: green;', msg);
}

function LOG_INFO(msg){
	console.log("%c [INFO]: %s", 'color: blue;', msg);
}

function LOG_WARNING(msg){
	console.log("%c [WARNING]: %s", 'color: purple;', msg);
}

function LOG_ERROR(msg){
	console.log("%c [ERROR]: %s", 'color: red;', msg);
}

export {LOG_DEBUG, LOG_INFO, LOG_WARNING, LOG_ERROR}
