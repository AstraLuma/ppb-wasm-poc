log
===
Textual informational log from Python (generally from stderr).

```
{
    $: 'log',
    l: String,
}
```

bad-msg
========
Got a bad message from Python
```
{
    $: 'bad-msg',
    m: String,
    e: Error
}
```

ready
=====
Python is ready to accept messages

```
{
    $: 'ready'
}
```

unready
=======
Python is no longer listening to messages

```
{
    $: 'unready'
}
```

exit
====
Python's main has returned.

```
{
    $: 'exit',
    retcode: int
}
```

inited
======
The WASM/emscripten runtime has initialized.

```
{
    $: 'inited'
}
```

abort
=====
There was a dramatic error.

```
{
    $: 'inited'
}
```
