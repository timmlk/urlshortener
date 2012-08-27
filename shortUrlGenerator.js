var encodingChars = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
var base = encodingChars.length;

/**
 * Encode a numeric id into a cool short url.
 * TODO TEST ME !
 * @param id number to encode
 * @returns shor url
 */
function encode(id){
	if(id==0){
		return encodingChars[0];
	}
	var enc = [];
	var i = id;
	while(i>0.01){
		var rem = (i%base).toFixed();
		enc.push(encodingChars[rem]);
		i/=base;
	}
	var res = enc.reverse().join('');
	return res;
}


exports.encode = encode;
