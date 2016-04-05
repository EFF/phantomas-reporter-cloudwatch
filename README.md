# phantomas-reporter-cloudwatch

AWS Cloudwatch reporter for phantomas

##Parameters

``<accessKeyId>:<secretKey>:<region>:<apiVersion>:<namespace>`` - shorthand for ``--aws-access-key-id``, ``--aws-secret-key``, ``--aws-region``, ``--aws-cloudwatch-api-version`` and ``--aws-cloudwatch-namespace``
* only AccessKeyId and SecretKey are required


## Usage

* Install phantomas-reporter-cloudwatch to your phantomas project dependencies
* Use it as specified in the [phantomas reporter docs](https://github.com/macbre/phantomas#reporters)

```
$ phantomas http://myapp.net -R cloudwatch --aws-access-key-id mykey --aws-secret-key mysecretkey --aws-region us-west-1 --aws-cloudwatch-api-version 2010-08-01 --aws-cloudwatch-namespace mynamespace
```

or

```
$ phantomas http://myapp.net -R cloudwatch:mykey:mysecretkey:us-west-1:2010-08-01:mynamespace
```
