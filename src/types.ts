export interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  longDescription: string;
  role: string;
  client: string;
  year: string;
  tags: string[];
  link?: string;
  gallery?: string[];
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  description: string;
  bullets?: string[];
}

export interface Message {
  name: string;
  email: string;
  subject: string;
  content: string;
}
