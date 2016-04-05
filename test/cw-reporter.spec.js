var rewire = require('rewire');
var reporter = rewire('../');

var AN_ACCESS_KEY_ID = '1111',
	AN_API_VERSION	= '2010-08-01',
	A_SECRET_KEY	= '2222',
	A_NAMESPACE		= 'namespace',
	A_REGION		= 'us-west-2';

var VALID_REPORTER_OPTIONS = [AN_ACCESS_KEY_ID, A_SECRET_KEY, A_REGION, AN_API_VERSION, A_NAMESPACE];

describe('phantomas cloudwatch reporter', function() {
    var mockedCloudWatchInstance,
        resetReporter;

    var MockedAWS = {CloudWatch: function () {}};

	beforeEach(function(){
		mockedCloudWatchInstance = jasmine.createSpyObj('instance', ['putMetricData']);
		MockedAWS.CloudWatch = jasmine.createSpy('CloudWatch').andReturn(mockedCloudWatchInstance);

		resetReporter = reporter.__set__('AWS', MockedAWS);
	});

    describe('initialization', function(){
        it('should initialize cloudwatch properly given full cohfiguration', function(){
            var phantomasResults = {
                getMetrics : jasmine.createSpy('getMetrics').andReturn({some:'metrics'})
            };
            var reporterModuleWrapper = {reporter : reporter};
            spyOn(reporterModuleWrapper, 'reporter').andCallThrough();

            reporterModuleWrapper.reporter(phantomasResults, VALID_REPORTER_OPTIONS, {}).render();
            var execpecteCloudWatchParams = {
                accessKeyId : AN_ACCESS_KEY_ID,
                secretAccessKey : A_SECRET_KEY,
                region : A_REGION,
                apiVersion : AN_API_VERSION
            };

            expect(MockedAWS.CloudWatch.callCount).toEqual(1);
            expect(MockedAWS.CloudWatch.mostRecentCall.args[0]).toEqual(execpecteCloudWatchParams);
            expect(phantomasResults.getMetrics.wasCalled).toBe(true);
        });

        it('should initialize cloudwatch properly only given AWS keys', function(){
            var keysOnlyReporterOptions = VALID_REPORTER_OPTIONS.slice(0,2);
            var phantomasResults = {
                getMetrics : jasmine.createSpy('getMetrics').andReturn({some:'metrics'})
            };
            var reporterModuleWrapper = {reporter : reporter};
            spyOn(reporterModuleWrapper, 'reporter').andCallThrough();

            reporterModuleWrapper.reporter(phantomasResults, keysOnlyReporterOptions, {}).render();
            var execpecteCloudWatchParams = {
                accessKeyId : AN_ACCESS_KEY_ID,
                secretAccessKey : A_SECRET_KEY,
                region : 'us-east-1', // default region
                apiVersion : 'latest' // default api version
            };

            expect(MockedAWS.CloudWatch.callCount).toEqual(1);
            expect(MockedAWS.CloudWatch.mostRecentCall.args[0]).toEqual(execpecteCloudWatchParams);
            expect(phantomasResults.getMetrics.wasCalled).toBe(true);
        });
    });

    describe('cloudwatch', function () {
        it('should not call putMetricData without numeric metrics', function(){
            var phantomasResults = {
                getMetrics : function(){
                    return {some: 'metric'};
                }
            };

            reporter(phantomasResults, VALID_REPORTER_OPTIONS, {}).render();

            expect(mockedCloudWatchInstance.putMetricData.wasCalled).toBe(false);
        });

        it('should call putMetricData once with less than 20 numeric metrics', function(){
            var phantomasResults = {
                getMetrics : function(){
                    var metrics = {};
                    for(var i = 0; i < 10; i++){
                        metrics['metric' + i] = i;
                    }
                    return metrics;
                }
            };

            reporter(phantomasResults, VALID_REPORTER_OPTIONS, {}).render();

            expect(mockedCloudWatchInstance.putMetricData.callCount).toBe(1);
            expect(mockedCloudWatchInstance.putMetricData.calls[0].args[0].MetricData.length).toEqual(10);
            expect(mockedCloudWatchInstance.putMetricData.calls[0].args[0].Namespace).toEqual(A_NAMESPACE);
        });

        it('should call putMetricData in chunks of 20 metrics when more than 20 numeric metrics', function(){
            var phantomasResults = {
                getMetrics : function(){
                    var metrics = {};
                    for(var i = 0; i < 25; i++){
                        metrics['metric' + i] = i;
                    }
                    return metrics;
                }
            };

            reporter(phantomasResults, VALID_REPORTER_OPTIONS, {}).render();

            expect(mockedCloudWatchInstance.putMetricData.callCount).toBe(2);
            expect(mockedCloudWatchInstance.putMetricData.calls[0].args[0].MetricData.length).toEqual(20);
            expect(mockedCloudWatchInstance.putMetricData.calls[1].args[0].MetricData.length).toEqual(5);
            expect(mockedCloudWatchInstance.putMetricData.calls[0].args[0].Namespace).toEqual(A_NAMESPACE);
        });
    });

	afterEach(function(){
		resetReporter();
	});
});
