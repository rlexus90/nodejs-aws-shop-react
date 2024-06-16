import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import path = require('path');

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
      bucketName: 'asw-shop',
      websiteIndexDocument: 'index.html',
			websiteErrorDocument: 'index.html',
    });

    const OAI = new cloudFront.OriginAccessIdentity(this, 'OAI-new', {
      comment: 'My distribution OAI',
    });


    const distribution = new cloudFront.CloudFrontWebDistribution(this, 'distrib', {
      originConfigs:[
        {
          behaviors:[{isDefaultBehavior:true},{
            pathPattern:'/*',
            // viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
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
