<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## Serving Static Pages as SPA( Single Page Application) with Nest.js

> Complete Folder Structure

```bash
NEST/
├──frontend/
|  ├──src/
|  ├──build/
│
├──src/
│  ├──main.ts
│  ├──app.module.ts
```

### 🌟 `tsconfig.json` 🌟

```json
"include": ["./src"],
"exclude": ["frontend", "frontend/**", "frontend/**/*"]
```

### Prepare frontend

`vite.config.ts`

```typescript
import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  server: {
    proxy: {
      // '/api': 'http://localhost:5000',
    },
  },
  build: {
    outDir: './build',
  },
});
```

build assets will be stored in `build` folder of `frontend` dir

```bash
NEST/
├──frontend/
|  ├──build/
```

### Prepare Nestjs Server

In order to serve static content like a Single Page Application (SPA) we can use the `ServeStaticModule` from the `@nestjs/serve-static` package.

```bash
yarn add @nestjs/serve-static
```

`app.module.ts`


```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    //....,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend', 'build'),
      exclude: ['/api*'],
    }),
    //.....
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```




### Build commands


```json
"scripts": {
    "start:dev": "nest start --watch",
    "prestart:dev": "yarn --cwd frontend install && yarn --cwd frontend build"
  },
```


### HEROKU: Skip pruning

If you need access to packages declared under `devDependencies` in a different buildpack or at runtime, then you can set `NPM_CONFIG_PRODUCTION=false` or `YARN_PRODUCTION=false` to skip the pruning step.

`heroku config:set NPM_CONFIG_PRODUCTION=false YARN_PRODUCTION=false`

```json
 "scripts": {
    "prebuild": "rimraf dist",
    "build": "nest build && yarn client:build",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "client": "yarn --cwd frontend dev",
    "client:build": "NPM_CONFIG_PRODUCTION=false YARN_PRODUCTION=false yarn --cwd frontend install && yarn --cwd frontend build"
  },
```