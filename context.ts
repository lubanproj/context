import * as events from 'events'

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

class emptyContext implements Context {

    Done(): boolean {
        return false;
    }

    Err(): Error {
        return undefined;
    }

    Value(key: any): any {
        return undefined
    }

}

var background = new emptyContext()

// Background returns an empty Context
function Background() : Context {
    return background
}

class valueContext implements Context {

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
            return this.value
        }
        return this.parent.Value(key)
    }

    constructor(parent? : Context, key? : string, value? : any) {
        this.parent = parent;
        this.key = key;
        this.value = value;
    }

}

// WithValue returns a Context which contains the key-value pairs
function WithValue(parent? : Context, key? : string, value? : any) : Context {
    return new valueContext(parent, key, value)
}

