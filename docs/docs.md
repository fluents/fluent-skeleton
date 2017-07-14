#  



### packages/skeleton/disted/cli.js


#### docs(pattern) 






##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| pattern | `Array.&lt;string&gt;`  | array of glob patterns | &nbsp; |




##### Returns


- `CLI`  @chainable



#### handle() 








##### Returns


- `AppCli`  @chainable




### packages/skeleton/disted/ObjChain.js


#### module.exports() 








##### Returns


- `Void`



#### dynamic(data) 

dynamically adds properties when called if they do not exist




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| data | `string` `Object`  | json data | &nbsp; |




##### Returns


- `JSONChain`  



#### init(data) 






##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| data | `string` `Object`  | json data | &nbsp; |




##### Returns


- `JSONChain`  



#### extend(methods[, nest&#x3D;false]) 

take strings, make them methods to .set on




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| methods | `Array.&lt;string&gt;`  |  | &nbsp; |
| nest&#x3D;false | `boolean`  | nest the .set | *Optional* |




##### Returns


- `JSONChain`  



#### has(key) 






##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| key | `any`  |  | &nbsp; |




##### Returns


- `Boolean`  



#### del(key) 

delete. remove




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| key | `any`  |  | &nbsp; |




##### Returns


- `ObjChain`  



#### val([key&#x3D;null]) 

get a value




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| key&#x3D;null | `any`  |  | *Optional* |




##### Returns


- `any`  current key or named if there is key param



#### use(obj) 






##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| obj | `Object`  |  | &nbsp; |




##### Returns


- `ObjChain`  




### packages/skeleton/disted/VFS.js


#### constructor(parent) 






##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| parent | `ChainedMap`  |  | &nbsp; |




##### Returns


- `Void`



#### file(name[, folder&#x3D;null]) 






##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| name | `string`  |  | &nbsp; |
| folder&#x3D;null | `string`  |  | *Optional* |




##### Returns


- `VFS`  @chainable



#### folder(name[, folder&#x3D;null]) 






##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| name | `string`  |  | &nbsp; |
| folder&#x3D;null | `string`  | nested folder | *Optional* |




##### Returns


- `VFS`  @chainable



#### filter(cb) 






##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| cb | `Function`  |  | &nbsp; |




##### Returns


- `VFS`  @chainable



#### create([force&#x3D;false]) 






##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| force&#x3D;false | `boolean`  | create even if it exists | *Optional* |




##### Returns


- `Folder`  @chainable



#### del() 








##### Returns


- `Folder`  @chainable



#### chwd(cwd) 

cd(): VFS {}




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| cwd | `string`  |  | &nbsp; |




##### Returns


- `VFS`  @chainable



#### cwd() 








##### Returns


- `string`  



#### toString() 








##### Returns


- `string`  



#### toConfig() 








##### Returns


- `[object Object]`  




### packages/skeleton/disted/VFSFolder.js


#### constructor(parent) 






##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| parent | `ChainedMap`  |  | &nbsp; |




##### Returns


- `Void`



#### file(file) 






##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| file | `File`  | for this folder | &nbsp; |




##### Returns


- `Folder`  @chainable



#### del() 








##### Returns


- `Folder`  @chainable



#### create([force&#x3D;false]) 






##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| force&#x3D;false | `boolean`  | create even if it exists | *Optional* |




##### Returns


- `Folder`  @chainable



#### toConfig() 








##### Returns


- `Object`  entries



#### toString() 








##### Returns


- `string`  




*Documentation generated with [doxdox](https://github.com/neogeek/doxdox).*
