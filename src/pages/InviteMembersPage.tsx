
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Users, Mail, Copy, Check, Phone, Link as LinkIcon, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useInvitations } from '@/hooks/useInvitations';
import Navigation from '@/components/Navigation';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const InviteMembersPage = () => {
  const navigate = useNavigate();
  const { id: chamaId } = useParams();
  const { toast } = useToast();
  const { invitations, createInvitation, isCreating, revokeInvitation } = useInvitations(chamaId || '');
  
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<string>('member');
  const [invitationMethod, setInvitationMethod] = useState<'email' | 'phone'>('email');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleInviteByEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      createInvitation({ email, role });
      setEmail('');
    }
  };

  const handleInviteByPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber) {
      createInvitation({ phoneNumber, role });
      setPhoneNumber('');
    }
  };

  const copyInviteLink = (invitationId: string, token: string | null | undefined) => {
    if (!token) {
      toast({
        title: 'Error',
        description: 'Invitation token not available',
        variant: 'destructive',
      });
      return;
    }
    
    const inviteUrl = `${window.location.origin}/join-chama?token=${token}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedToken(invitationId);
    toast({
      title: 'Link copied',
      description: 'Invitation link copied to clipboard',
    });
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleRevoke = (invitationId: string) => {
    if (confirm('Are you sure you want to revoke this invitation?')) {
      revokeInvitation(invitationId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'accepted':
        return <Badge variant="default">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'expired':
        return <Badge variant="outline">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Invite Members</h1>
              <p className="text-muted-foreground">Grow your Chama community</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Invitation Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Invitation Method</CardTitle>
                <CardDescription>
                  Select how you want to invite new members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <Button
                    variant={invitationMethod === 'email' ? 'default' : 'outline'}
                    onClick={() => setInvitationMethod('email')}
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                  <Button
                    variant={invitationMethod === 'phone' ? 'default' : 'outline'}
                    onClick={() => setInvitationMethod('phone')}
                    className="flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Phone
                  </Button>
                </div>

                {invitationMethod === 'email' ? (
                  <form onSubmit={handleInviteByEmail} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="friend@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="treasurer">Treasurer</SelectItem>
                          <SelectItem value="secretary">Secretary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" disabled={isCreating} className="w-full">
                      {isCreating ? 'Creating Invitation...' : 'Create Email Invitation'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleInviteByPhone} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="0712345678"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role-phone">Role</Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="treasurer">Treasurer</SelectItem>
                          <SelectItem value="secretary">Secretary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" disabled={isCreating} className="w-full">
                      {isCreating ? 'Creating Invitation...' : 'Create Phone Invitation'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Recent Invitations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Invitations</CardTitle>
                <CardDescription>
                  Track your sent invitations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invitations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No invitations sent yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {invitations.map((invitation) => (
                      <div key={invitation.id} className="flex justify-between items-start p-4 bg-muted/50 rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">
                              {invitation.email || invitation.phone_number}
                            </p>
                            {invitation.role && invitation.role !== 'member' && (
                              <Badge variant="outline" className="text-xs">
                                {invitation.role}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Sent {formatDate(invitation.created_at)}
                            {invitation.expires_at && (
                              <span> • Expires {formatDate(invitation.expires_at)}</span>
                            )}
                          </p>
                          {invitation.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyInviteLink(invitation.id, invitation.invitation_token)}
                              >
                                {copiedToken === invitation.id ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <LinkIcon className="h-3 w-3 mr-1" />
                                    Copy Link
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRevoke(invitation.id)}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Revoke
                              </Button>
                            </div>
                          )}
                        </div>
                        <div>
                          {getStatusBadge(invitation.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InviteMembersPage;
