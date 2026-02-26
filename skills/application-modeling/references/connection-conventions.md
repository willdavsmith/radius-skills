# Connection Conventions

## Overview

When a Radius container has a `connection` to a resource, Radius injects environment variables into the container so your application code can discover the resource's connection details at runtime.

**The format of these environment variables differs** depending on whether you use `Applications.Core/containers` (built-in) or `Radius.Compute/containers` (recipe-based).

## Applications.Core/containers — Individual Env Vars

Each readOnly property from the connected resource becomes a separate environment variable:

```
CONNECTION_<NAME>_<PROPERTY>
```

For a connection named `postgres` to a database resource:

| Variable | Example Value |
|----------|---------------|
| `CONNECTION_POSTGRES_HOST` | `postgres-svc.default.svc.cluster.local` |
| `CONNECTION_POSTGRES_PORT` | `5432` |
| `CONNECTION_POSTGRES_DATABASE` | `mydb` |
| `CONNECTION_POSTGRES_USERNAME` | `admin` |
| `CONNECTION_POSTGRES_PASSWORD` | `secret123` |

## Radius.Compute/containers — JSON Properties Blob

All properties are packed into a single JSON environment variable, plus metadata:

| Variable | Example Value |
|----------|---------------|
| `CONNECTION_POSTGRES_PROPERTIES` | `{"host":"postgres-svc...","port":"5432","database":"mydb","username":"admin","password":"secret123"}` |
| `CONNECTION_POSTGRES_ID` | `/planes/radius/local/resourceGroups/.../Radius.Data/postgreSqlDatabases/postgres` |
| `CONNECTION_POSTGRES_NAME` | `postgres` |
| `CONNECTION_POSTGRES_TYPE` | `Radius.Data/postgreSqlDatabases` |

> **Key detail:** Property names in the JSON blob are **lowercase** (matching the resource type schema), while the connection name is **UPPERCASE**.

## Writing Portable Application Code

To support both connection formats, check for `_PROPERTIES` first, then fall back to individual vars:

### Go

```go
import (
    "encoding/json"
    "fmt"
    "os"
    "strings"
)

func getConnProp(connName, prop string) string {
    propsJSON := os.Getenv("CONNECTION_" + connName + "_PROPERTIES")
    if propsJSON != "" {
        var props map[string]interface{}
        if err := json.Unmarshal([]byte(propsJSON), &props); err == nil {
            if val, ok := props[strings.ToLower(prop)]; ok {
                return fmt.Sprintf("%v", val)
            }
        }
    }
    return os.Getenv("CONNECTION_" + connName + "_" + prop)
}

// Usage:
// host := getConnProp("POSTGRES", "HOST")
// port := getConnProp("POSTGRES", "PORT")
```

### Node.js

```javascript
function getConnProp(connName, prop) {
  const propsJson = process.env[`CONNECTION_${connName}_PROPERTIES`];
  if (propsJson) {
    try {
      const props = JSON.parse(propsJson);
      return props[prop.toLowerCase()] || '';
    } catch (e) { /* fall through */ }
  }
  return process.env[`CONNECTION_${connName}_${prop}`] || '';
}

// Usage:
// const host = getConnProp('POSTGRES', 'HOST');
// const port = getConnProp('POSTGRES', 'PORT');
```

### Python

```python
import json
import os

def get_conn_prop(conn_name: str, prop: str) -> str:
    props_json = os.getenv(f"CONNECTION_{conn_name}_PROPERTIES", "")
    if props_json:
        try:
            props = json.loads(props_json)
            return str(props.get(prop.lower(), ""))
        except json.JSONDecodeError:
            pass
    return os.getenv(f"CONNECTION_{conn_name}_{prop}", "")

# Usage:
# host = get_conn_prop("POSTGRES", "HOST")
# port = get_conn_prop("POSTGRES", "PORT")
```

## Common Gotchas

- **Case sensitivity:** JSON keys in `_PROPERTIES` are lowercase (`host`, `port`). Connection name in env var prefix is UPPERCASE (`POSTGRES`). The property argument to helper functions is typically passed as UPPERCASE and must be lowered before JSON lookup.
- **Number types:** JSON may parse `port` as a number. Always convert to string when needed for connection strings.
- **Multiple connections:** Each connection gets its own set of env vars. A container with connections to both `postgres` and `redis` will have `CONNECTION_POSTGRES_*` and `CONNECTION_REDIS_*`.
