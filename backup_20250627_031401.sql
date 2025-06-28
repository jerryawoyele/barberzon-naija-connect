--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: BarberJoinRequest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BarberJoinRequest" (
    id text NOT NULL,
    "barberId" text NOT NULL,
    "shopId" text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    message text,
    "seatNumber" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BarberJoinRequest" OWNER TO postgres;

--
-- Name: BarberProfile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BarberProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "shopId" text,
    specialties text[],
    "hourlyRate" double precision DEFAULT 0 NOT NULL,
    rating double precision DEFAULT 0 NOT NULL,
    "totalReviews" integer DEFAULT 0 NOT NULL,
    "isAvailable" boolean DEFAULT true NOT NULL,
    "isSolo" boolean DEFAULT false NOT NULL,
    "seatNumber" integer,
    status text DEFAULT 'available'::text NOT NULL,
    bio text,
    experience text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BarberProfile" OWNER TO postgres;

--
-- Name: Booking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Booking" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "shopId" text NOT NULL,
    "barberId" text NOT NULL,
    "bookingDate" timestamp(3) without time zone NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    services text[],
    "totalAmount" double precision NOT NULL,
    status text NOT NULL,
    "paymentStatus" text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Booking" OWNER TO postgres;

--
-- Name: CustomerProfile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CustomerProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "locationLat" double precision,
    "locationLng" double precision,
    "bookingPreferences" jsonb,
    "loyaltyPoints" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CustomerProfile" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "dataPayload" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: PaymentMethod; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PaymentMethod" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    type text NOT NULL,
    "cardLastFour" text,
    "bankName" text,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PaymentMethod" OWNER TO postgres;

--
-- Name: PushToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PushToken" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "deviceToken" text NOT NULL,
    platform text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PushToken" OWNER TO postgres;

--
-- Name: Review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    "bookingId" text NOT NULL,
    "customerId" text NOT NULL,
    "barberId" text NOT NULL,
    rating double precision NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Review" OWNER TO postgres;

--
-- Name: Service; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Service" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    name text NOT NULL,
    description text,
    price double precision NOT NULL,
    "durationMinutes" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Service" OWNER TO postgres;

--
-- Name: Shop; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Shop" (
    id text NOT NULL,
    "ownerId" text NOT NULL,
    name text NOT NULL,
    description text,
    address text NOT NULL,
    "phoneNumber" text NOT NULL,
    email text,
    "locationLat" double precision NOT NULL,
    "locationLng" double precision NOT NULL,
    "openingHours" jsonb NOT NULL,
    "totalSeats" integer DEFAULT 4 NOT NULL,
    rating double precision DEFAULT 0 NOT NULL,
    "totalReviews" integer DEFAULT 0 NOT NULL,
    images text[],
    "isVerified" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Shop" OWNER TO postgres;

--
-- Name: ShopSeat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ShopSeat" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    "seatNumber" integer NOT NULL,
    "barberId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ShopSeat" OWNER TO postgres;

--
-- Name: Transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Transaction" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    amount double precision NOT NULL,
    reference text NOT NULL,
    status text NOT NULL,
    "paymentMethod" text,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Transaction" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text,
    "phoneNumber" text NOT NULL,
    password text NOT NULL,
    "fullName" text NOT NULL,
    "profileImage" text,
    role text,
    "completedOnboarding" boolean DEFAULT false NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: Wallet; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Wallet" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    balance double precision DEFAULT 0 NOT NULL,
    currency text DEFAULT 'NGN'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Wallet" OWNER TO postgres;

--
-- Name: _CustomerFavorites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_CustomerFavorites" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_CustomerFavorites" OWNER TO postgres;

--
-- Data for Name: BarberJoinRequest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BarberJoinRequest" (id, "barberId", "shopId", status, message, "seatNumber", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: BarberProfile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BarberProfile" (id, "userId", "shopId", specialties, "hourlyRate", rating, "totalReviews", "isAvailable", "isSolo", "seatNumber", status, bio, experience, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Booking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Booking" (id, "customerId", "shopId", "barberId", "bookingDate", "startTime", "endTime", services, "totalAmount", status, "paymentStatus", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CustomerProfile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CustomerProfile" (id, "userId", "locationLat", "locationLng", "bookingPreferences", "loyaltyPoints", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, "userId", type, title, message, "isRead", "dataPayload", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PaymentMethod; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PaymentMethod" (id, "customerId", type, "cardLastFour", "bankName", "isDefault", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PushToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PushToken" (id, "userId", "deviceToken", platform, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Review" (id, "bookingId", "customerId", "barberId", rating, comment, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Service; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Service" (id, "shopId", name, description, price, "durationMinutes", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Shop; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Shop" (id, "ownerId", name, description, address, "phoneNumber", email, "locationLat", "locationLng", "openingHours", "totalSeats", rating, "totalReviews", images, "isVerified", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ShopSeat; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ShopSeat" (id, "shopId", "seatNumber", "barberId", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Transaction" (id, "userId", type, amount, reference, status, "paymentMethod", description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, "phoneNumber", password, "fullName", "profileImage", role, "completedOnboarding", "isVerified", "emailVerified", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Wallet; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Wallet" (id, "customerId", balance, currency, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _CustomerFavorites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_CustomerFavorites" ("A", "B") FROM stdin;
\.


--
-- Name: BarberJoinRequest BarberJoinRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BarberJoinRequest"
    ADD CONSTRAINT "BarberJoinRequest_pkey" PRIMARY KEY (id);


--
-- Name: BarberProfile BarberProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BarberProfile"
    ADD CONSTRAINT "BarberProfile_pkey" PRIMARY KEY (id);


--
-- Name: Booking Booking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_pkey" PRIMARY KEY (id);


--
-- Name: CustomerProfile CustomerProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CustomerProfile"
    ADD CONSTRAINT "CustomerProfile_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: PaymentMethod PaymentMethod_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PaymentMethod"
    ADD CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY (id);


--
-- Name: PushToken PushToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PushToken"
    ADD CONSTRAINT "PushToken_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: Service Service_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Service"
    ADD CONSTRAINT "Service_pkey" PRIMARY KEY (id);


--
-- Name: ShopSeat ShopSeat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShopSeat"
    ADD CONSTRAINT "ShopSeat_pkey" PRIMARY KEY (id);


--
-- Name: Shop Shop_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shop"
    ADD CONSTRAINT "Shop_pkey" PRIMARY KEY (id);


--
-- Name: Transaction Transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Wallet Wallet_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wallet"
    ADD CONSTRAINT "Wallet_pkey" PRIMARY KEY (id);


--
-- Name: _CustomerFavorites _CustomerFavorites_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_CustomerFavorites"
    ADD CONSTRAINT "_CustomerFavorites_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: BarberJoinRequest_barberId_shopId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "BarberJoinRequest_barberId_shopId_key" ON public."BarberJoinRequest" USING btree ("barberId", "shopId");


--
-- Name: BarberProfile_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "BarberProfile_userId_key" ON public."BarberProfile" USING btree ("userId");


--
-- Name: CustomerProfile_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CustomerProfile_userId_key" ON public."CustomerProfile" USING btree ("userId");


--
-- Name: PushToken_deviceToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PushToken_deviceToken_key" ON public."PushToken" USING btree ("deviceToken");


--
-- Name: Review_bookingId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Review_bookingId_key" ON public."Review" USING btree ("bookingId");


--
-- Name: ShopSeat_shopId_seatNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ShopSeat_shopId_seatNumber_key" ON public."ShopSeat" USING btree ("shopId", "seatNumber");


--
-- Name: Transaction_reference_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Transaction_reference_key" ON public."Transaction" USING btree (reference);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_phoneNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_phoneNumber_key" ON public."User" USING btree ("phoneNumber");


--
-- Name: Wallet_customerId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Wallet_customerId_key" ON public."Wallet" USING btree ("customerId");


--
-- Name: _CustomerFavorites_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_CustomerFavorites_B_index" ON public."_CustomerFavorites" USING btree ("B");


--
-- Name: BarberJoinRequest BarberJoinRequest_barberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BarberJoinRequest"
    ADD CONSTRAINT "BarberJoinRequest_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES public."BarberProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: BarberJoinRequest BarberJoinRequest_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BarberJoinRequest"
    ADD CONSTRAINT "BarberJoinRequest_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: BarberProfile BarberProfile_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BarberProfile"
    ADD CONSTRAINT "BarberProfile_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: BarberProfile BarberProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BarberProfile"
    ADD CONSTRAINT "BarberProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Booking Booking_barberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES public."BarberProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Booking Booking_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."CustomerProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Booking Booking_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CustomerProfile CustomerProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CustomerProfile"
    ADD CONSTRAINT "CustomerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PaymentMethod PaymentMethod_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PaymentMethod"
    ADD CONSTRAINT "PaymentMethod_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."CustomerProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PushToken PushToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PushToken"
    ADD CONSTRAINT "PushToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_barberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES public."BarberProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public."Booking"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."CustomerProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Service Service_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Service"
    ADD CONSTRAINT "Service_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ShopSeat ShopSeat_barberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShopSeat"
    ADD CONSTRAINT "ShopSeat_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES public."BarberProfile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ShopSeat ShopSeat_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShopSeat"
    ADD CONSTRAINT "ShopSeat_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Shop Shop_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shop"
    ADD CONSTRAINT "Shop_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."BarberProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaction Transaction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Wallet Wallet_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wallet"
    ADD CONSTRAINT "Wallet_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."CustomerProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: _CustomerFavorites _CustomerFavorites_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_CustomerFavorites"
    ADD CONSTRAINT "_CustomerFavorites_A_fkey" FOREIGN KEY ("A") REFERENCES public."CustomerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _CustomerFavorites _CustomerFavorites_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_CustomerFavorites"
    ADD CONSTRAINT "_CustomerFavorites_B_fkey" FOREIGN KEY ("B") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

