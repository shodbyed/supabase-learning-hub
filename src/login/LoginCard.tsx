import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface LoginCardProps {
  title: string;
  children: React.ReactNode;
}

export const LoginCard: React.FC<LoginCardProps> = ({ title, children }) => {
  return (
    <Card className="w-1/2 mx-auto mt-25 p-4 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
