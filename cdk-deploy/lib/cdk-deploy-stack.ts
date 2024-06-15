import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import path = require('path');
// import * as sqs from 'aws-cdk-lib/aws-sqs';

const {
  aws_s3: s3,
  aws_s3_deployment: deploy,
  aws_cloudfront: cloudFront,
  aws_cloudfront_origins: origins,
  aws_iam: iam,
} = cdk;

export class CdkDeployStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    s3;

    const bucket = new s3.Bucket(this, 'aws-shop', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      // accessControl: s3.BucketAccessControl.PRIVATE,
      bucketName: 'asw-shop',
      websiteIndexDocument: 'index.html',
    });

    const OAI = new cloudFront.OriginAccessIdentity(this, 'OAI-new', {
      comment: 'My distribution OAI',
    });

    // const distribution = new cloudFront.Distribution(this, 'Distribution', {
    //   defaultBehavior: {
    //     origin: new origins.S3Origin(bucket, {
    //       originAccessIdentity: OAI,
    //     }),
    //     allowedMethods: cloudFront.AllowedMethods.ALLOW_ALL,
    //     viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    //   },
    //   defaultRootObject: 'index.html',
    // });

    const distribution = new cloudFront.CloudFrontWebDistribution(this, 'distrib', {
      originConfigs:[
        {
          behaviors:[{isDefaultBehavior:true},{
            pathPattern:'/*',
            viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          }],
          s3OriginSource:{
            s3BucketSource: bucket,
            originAccessIdentity: OAI,
          },
        },
      ]
    })

    
    bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [bucket.arnForObjects('*')],
        principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
        conditions: {
          "StringEquals":{
            "AWS:SourceArn":`arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`
          }
        },
        effect: iam.Effect.ALLOW,
        sid:"AllowCloudFrontServicePrincipalReadOnly",
      })
    );
    
    bucket.grantRead(OAI);

    new deploy.BucketDeployment(this, 'deploy', {
      sources: [deploy.Source.asset('../dist')],
      destinationBucket: bucket,
      distribution: distribution,
      distributionPaths: ['/*'],
    });
  }
}
