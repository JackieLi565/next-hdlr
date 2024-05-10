# Next-Hdlr

A HTTP route method utility for Next.js 12 api handlers.

## Use Case

Do you often find yourself creating large switch statements when creating a new API in Next.js?

```js
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case "GET":
        await GET(req, res);
        break;
      case "POST":
        await POST(req, res);
        break;
      case "PATCH":
        await PATCH(req, res);
        break;
      case "PUT":
        await PUT(req, res);
        break;
      case "DELETE":
        await DELETE(req, res);
        break;
      default:
        res.setHeader("Allow", ["GET", "POST", "PATCH", "PUT", "DELETE"]);
        return res
          .status(ResponseStatus.MethodNotAllowed)
          .send("Method Not Allowed");
    }
  } catch (e: any) {
    return res
      .status(ResponseStatus.InternalServerError)
      .send("Internal Server Error");
  }
}

// Handlers ...
```

If so, Next-Hdlr Is the perfect utility for you, as you can take all that boiler plate and narrow it down to:

```js
const handler = new RouteHandler();

handler.get((req, res) => GET(req, res));

handler.post((req, res) => POST(req, res));

handler.patch((req, res) => PATCH(req, res));

handler.put((req, res) => PUT(req, res));

handler.delete((req, res) => DELETE(req, res));

export default handler.build();
```

Ahh yes, much cleaner 🥤

## Basic Usage

Let's take a look at how to use Next-Hdlr for your next or current project.

### Install

First you will need to add it to your project. Next-Hdlr only supports Next.js versions 9.0.0 and up.

```shell
npm i next-hdlr
```

### Creating a Route Handler

You can configure individual routes using the RouteHandler class. This class allows you to define handlers for different [HTTP methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) like `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`.

Here’s how you set up a simple API handler within the `/pages/api` directory:

```js
import { RouteHandler } from "next-hdlr";

const handler = new RouteHandler();

// Define endpoints
handler.get((req, res) => {
  res.status(200).json({ message: "GET request success" });
});

handler.post((req, res) => {
  res.status(201).json({ message: "POST request success" });
});
```

### Exporting Your Handler

After defining all the routes, use the `build()` method to create your route handler:

```js
export default handler.build();
```

### Configuration Options

`RouteHandler` accepts a configuration object with optional settings:

- `methodFn`: Function to handle unsupported methods.
- `errorFn`: Function to handle errors during the execution of your route logic.
- `sessionFn`: Optional function to handle session validation or creation.

Passing in a custom function will override the default `errorFn` and `methodFn`.

### Global Configuration

If you only need to define your configuration once you can export a `DefaultHandler` to create `RouteHandler`'s that inherent your default configuration.

```js
import { DefaultHandler } from "next-hdlr";

const config = {
  // Global configuration
};

export default new DefaultHandler(config);
```

You can then create `RouteHandler`'s by using the `create` method

```js
import DefaultHandler from "my/defaultHandler/path";

const handler = DefaultHandler.create();

handler.get((req, res) => {
  res.status(200).json({ message: "GET request success" });
});

export default handler.build();
```

### Middleware (Handling Sessions)

If your project requires any form of authorization or you simply want to run some logic before your method handler fires off - You can integrate session handling directly into your route configuration:

```js
const handler = new RouteHandler({
  sessionFn: async (req, res) => {
    // Session logic here
    const isAuthorized = true;

    if (isAuthorized) {
      res.status(401).send("Unauthorized");
      return;
    }
    return { user: "username" };
  },
});

handler.get(async (req, res, session) => {
  /**
   * session parameter receives the object:
   * { user: "username" }
   **/
  res.status(200).json({ message: `Welcome ${session.user}` });
});

export default handler.build();
```

For TypeScript users `RouteHandler` accepts a generic for the `sessionFn` response.

```ts
interface Session {
  user: string;
}

new RouteHandler<Session>({
  sessionFn: async (req, res) => {
    // Session logic here
    return { user: "username" };
  },
});
```

### Error Handling

You can define a custom error function to manage unexpected errors across your API:

```js
new RouteHandler({
  errorFn: (req, res, err) => {
    console.error("Error:", err);
    res.status(500).send("Internal Server Error");
  },
});
```

The `err` parameter receives the error thrown by one of the method handlers if it were to occur.

### Invalid Method Handling

If you would like to log or handle invalid methods requests on your own you can do so by providing a custom method handler:

```js
new RouteHandler({
  methodFn: (req, res) => {
    console.log("invalid method");
    res.status(405).send("Method not Allowed");
  },
});
```

## Issues

If you find that something is not right with the API please create a new issue. Contributions are also welcome!
