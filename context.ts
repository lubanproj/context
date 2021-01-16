// Context is the context of the thread,
// we can manage the status of data through Context
interface Context {

    // Done returns whether the process is finished
    Done() : boolean

    // Err returns an Error while an exception occured in context,
    // returns null while the context completed
    Err() : Error

    // Value return the value for a given key in context
    Value(key : any) : any

}

// EmptyContext is an empty context implements interface Context
class EmptyContext implements Context {

    Done(): boolean {
        return false;
    }

    Err(): Error {
        return undefined;
    }

    Value(key: any): any {
        return undefined;
    }

}

var background = new EmptyContext();

// Background returns an empty Context
function Background() : Context {
    return background;
}

// ValueContext carries a key-value pair
class ValueContext implements Context {

    parent : Context;
    key : string;
    value : any;

    Done(): boolean {
        return false;
    }

    Err(): Error {
        return undefined;
    }

    Value(key: any): any {
        if (this.key === key) {
            return this.value;
        }
        return this.parent.Value(key);
    }

    constructor(parent? : Context, key? : string, value? : any) {
        this.parent = parent;
        this.key = key;
        this.value = value;
    }

}

// WithValue returns a Context which contains the key-value pairs
function WithValue(parent? : Context, key? : string, value? : any) : Context {
    return new ValueContext(parent, key, value);
}

var cancelCtxKey : number

class CancelContext implements Context {

    parent : Context;
    children : CancelContext[];
    done : boolean;
    err : Error;


    IsDead(): boolean {
        return this.done;
    }

    Err(): Error {
        return this.err;
    }

    Value(key: any): any {
        if (key == cancelCtxKey) {
            return this
        }
        return undefined;
    }

}

var Canceled = new Error("context canceled")

function WithCancel(parent : Context) {
    if (parent == undefined) {
        return
    }
    const cancelContext = new CancelContext();
    cancelContext.parent = parent;

    return {
        cancelContext,
        function() {
            cancel(cancelContext, Canceled);
        }
    }
}

function cancel(cancelCtx : CancelContext, err : Error) {
    if (cancelCtx == undefined) {
        return new Error("cancelCtx is undefined");
    }

    if (err == undefined) {
        return new Error("err is undefined");
    }
    cancelCtx.err = err;

    // remove children first
    cancelCtx.children.forEach((child, index) => {
        cancel(child, err);
    });

    cancelCtx.children = undefined;

    removeChild(cancelCtx.parent, cancelCtx);
}

function removeChild(parent : Context, self : CancelContext) : Error {
    if (parent == undefined) {
        return new Error("parent is undefined");
    }
    if (!(parent instanceof CancelContext)) {
        return
    }
    parent.children.forEach((child, index) => {
        if (child == self) {
            delete(parent.children[index]);
        }
    })

    self.done = true;
}

class TimerContext extends CancelContext implements Context {

    start : number;
    timeout : number;
    err : Error;

    Overage() : number {
        return new Date().getTime() - this.start;
    }

    Done(): boolean {
        const duration = new Date().getTime() - this.start;
        if (duration < 0 || duration > this.timeout) {
            return true;
        }
        return false;
    }

    Err(): Error {
        return this.err;
    }

}

// WithTimeout return a Context that carries a timer
// the Context will dead while the time if after the given timeout
function WithTimeout(parent : Context, timeout : number) {
    const timerContext = new TimerContext();
    timerContext.parent = parent;
    timerContext.timeout = timeout;

    if (parent.Done()) {
        return
    }

    cancelAfterTime(timerContext, timeout)

    return timerContext
}

async function cancelAfterTime (cancelContext: CancelContext, timeout : number) {
    setTimeout(() => {cancel(cancelContext, Canceled)}, timeout)
}





