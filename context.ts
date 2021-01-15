// Context is the context of the thread,
// we can manage the life cycle of  context data of the thread through Context
interface Context {

    // Deadline means the death of the context, once the context is Deadline()
    // it returns the time of the context, and returns ok == true while the context
    // is already dead, which means The process is completed. Deadline() returns
    // ok == false while the context is alive
    Deadline() : { Date, boolean}

    // Done returns a Function which may always be a listener
    Done() : Function

    // Err returns an Error while an exception occured in context,
    // returns null while the context completed
    Err() : Error

    // Value returns the value associated with context for key
    Value(key : any) : any

}

class emptyContext implements Context {

    Deadline(): { Date; boolean } {
        return {Date: undefined, boolean: undefined};
    }

    Done(): Function {
        return undefined;
    }

    Err(): Error {
        return undefined;
    }

    Value(key: any): any {

    }

}

var background = new emptyContext()

// Background returns an empty Context
function Background() : Context {
    return background
}

class valueContext implements Context {

    parent : Context;
    data : Map<string, any>;

    Deadline(): { Date; boolean } {
        return {Date: undefined, boolean: undefined};
    }

    Done(): Function {
        return undefined;
    }

    Err(): Error {
        return undefined;
    }

    Value(key: any): any {
        if (this.data.has(key)) {
            return this.data.get(key)
        }
        return this.parent.Value(key)
    }

    constructor(parent? : Context, key? : string, value? : any) {
        this.parent = parent;
        this.data = new Map<string, any>();
    }

}

// WithValue returns a Context which contains the key-value pairs
function WithValue(parent? : Context, key? : string, value? : any) : Context {
    return new valueContext(parent, key, value)
}

// GetValue returns a Value from a valueContext by a given key
function GetValue(context : valueContext, key : string) : any {
    return context.data.get(key)
}

// SetValue set the key-value pairs for a valueContext
function SetValue(context : valueContext, key : string, value : any) {
    if (context == undefined || key == undefined) {
        return
    }
    context.data.set(key, value)
}





