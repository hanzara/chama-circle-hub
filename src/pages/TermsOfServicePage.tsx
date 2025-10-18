import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfServicePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center border-b">
            <CardTitle className="text-3xl font-bold text-primary">
              Terms of Service
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>

          <CardContent className="prose prose-slate max-w-none p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using our Chama management platform ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">2. Service Description</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our platform provides digital financial services including but not limited to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Chama (investment group) management and administration</li>
                <li>Digital wallet and payment processing services</li>
                <li>Savings and investment goal tracking</li>
                <li>Loan application and management services</li>
                <li>Budget tracking and financial analytics</li>
                <li>Bill payment and merchant deal services</li>
                <li>Peer-to-peer lending and trading capabilities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">3. User Accounts and Responsibilities</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Account Creation</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    You must provide accurate, complete, and current information during registration. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Age Requirements</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    You must be at least 18 years old to use our financial services. By using the Service, you represent and warrant that you meet this age requirement.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">KYC Verification</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To comply with financial regulations, you may be required to complete Know Your Customer (KYC) verification processes, including providing valid identification documents.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">4. Financial Services Terms</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Transaction Processing</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    All financial transactions are processed through licensed third-party payment processors. Transaction fees may apply and will be clearly disclosed before completion.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Loan Services</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Loan eligibility, terms, and interest rates are determined based on various factors including credit assessment and platform algorithms. All loan agreements are binding contracts.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Investment Risks</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    All investments carry risk. Past performance does not guarantee future results. You are responsible for understanding the risks associated with your investment decisions.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">5. Prohibited Uses</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree not to use the Service for any unlawful purposes or to conduct any unlawful activity, including but not limited to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Money laundering or terrorist financing</li>
                <li>Fraud, impersonation, or providing false information</li>
                <li>Violating any applicable laws or regulations</li>
                <li>Interfering with the security or integrity of the platform</li>
                <li>Unauthorized access to other users' accounts or data</li>
                <li>Using the service for commercial purposes without authorization</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">6. Privacy and Data Protection</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">7. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service and its original content, features, and functionality are and will remain the exclusive property of our platform and its licensors. The Service is protected by copyright, trademark, and other laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">8. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses resulting from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">9. Service Availability</h2>
              <p className="text-muted-foreground leading-relaxed">
                We strive to maintain high service availability but cannot guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue any aspect of the Service with or without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">10. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will cease immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">11. Dispute Resolution</h2>
              <p className="text-muted-foreground leading-relaxed">
                Any disputes arising from these Terms or your use of the Service will be resolved through binding arbitration in accordance with the laws of Kenya. You waive any right to participate in class-action lawsuits or class-wide arbitration.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">12. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to update these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last updated" date. Continued use of the Service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">13. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be interpreted and governed by the laws of Kenya, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">14. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Email: legal@chamaapp.com<br />
                  Address: Nairobi, Kenya<br />
                  Phone: +254 XXX XXX XXX
                </p>
              </div>
            </section>

            <section className="border-t pt-6">
              <p className="text-sm text-muted-foreground italic">
                By using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfServicePage;