# Load Deployment Guide

## Auto-Loaded Context
@DEPLOYMENT.md

## Purpose
Load Railway deployment documentation, configuration, and troubleshooting guides.

## When to Use
- Preparing to deploy to Railway
- Troubleshooting deployment issues
- Setting up new deployment pipeline
- Configuring environment variables
- Understanding deployment process
- Rolling back deployments

## What's Included

This guide covers:

### Pre-Deployment
- Code quality checklist
- Environment variable configuration
- Database preparation
- Build verification

### Railway Configuration
- railway.json setup
- Environment variables
- Health check endpoints
- Restart policies

### Deployment Process
- Initial deployment steps
- Automatic vs manual deployment
- Railway CLI commands
- GitHub integration

### Post-Deployment
- Verification steps
- Health check testing
- Log monitoring
- Database verification

### Monitoring & Maintenance
- Viewing logs
- Performance metrics
- Resource usage
- Alert configuration

### Troubleshooting
- Common deployment errors
- Database connection issues
- Environment variable problems
- Rollback procedures

## Quick Commands

```bash
# Deploy
railway up

# View logs
railway logs

# Check status
railway status

# Set environment variable
railway variables set KEY="value"
```

## Next Steps

After loading this guide:
- Complete pre-deployment checklist
- Configure Railway project
- Set all environment variables
- Deploy and verify
- Set up monitoring
- Document any custom configuration
