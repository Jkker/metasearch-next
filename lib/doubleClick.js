const doubletapDeltaTime = 700;
let doubletap1Function = null;
let doubletap2Function = null;
let doubletapTimer = null;
export default function tap(singleTapFunc, doubleTapFunc) {
	if (doubletapTimer == null) {
		// First tap, we wait X ms to the second tap
		doubletapTimer = setTimeout(doubletapTimeout, doubletapDeltaTime);
		doubletap1Function = singleTapFunc;
		doubletap2Function = doubleTapFunc;
	} else {
		// Second tap
		clearTimeout(doubletapTimer);
		doubletapTimer = null;
		doubletap2Function();
	}
}

function doubletapTimeout() {
	// Wait for second tap timeout
	doubletap1Function();
	doubleTapTimer = null;
}
