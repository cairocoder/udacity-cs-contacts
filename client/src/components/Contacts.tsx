import dateFormat from 'dateformat'
import { History } from 'history'
import * as React from 'react'
import {
  Card,
  CardGroup,
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createContact, deleteContact, getContacts } from '../api/contacts-api'
import Auth from '../auth/Auth'
import { Contact } from '../types/Contact'

interface ContactsProps {
  auth: Auth
  history: History
}

interface ContactsState {
  contacts: Contact[]
  newContactName: string
  newContactPhone: string
  loadingContacts: boolean
}

export class Contacts extends React.PureComponent<ContactsProps, ContactsState> {
  state: ContactsState = {
    contacts: [],
    newContactName: '',
    newContactPhone: '',
    loadingContacts: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newContactName: event.target.value })
  }

  handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newContactPhone: event.target.value })
  }

  onEditButtonClick = (contactId: string) => {
    this.props.history.push(`/contacts/${contactId}/edit`)
  }

  onContactCreate = async () => {
    if(this.state.newContactName.length < 3) {
      alert('Please enter valid contact name [min 3 chars]')
      return false;
    }
    if(this.state.newContactPhone.length < 11) {
      alert('Please enter valid contact mobile number [min 11 digits]')
      return false;
    }
    try {
      const newContact = await createContact(this.props.auth.getIdToken(), {
        name: this.state.newContactName,
        phone: this.state.newContactPhone
      })
      this.setState({
        contacts: [...this.state.contacts, newContact],
        newContactName: '',
        newContactPhone: ''
      })
    } catch {
      alert('Contact creation failed')
    }
  }

  onContactDelete = async (contactId: string) => {
    try {
      await deleteContact(this.props.auth.getIdToken(), contactId)
      this.setState({
        contacts: this.state.contacts.filter(contact => contact.contactId !== contactId)
      })
    } catch {
      alert('Contact deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const contacts = await getContacts(this.props.auth.getIdToken())
      this.setState({
        contacts,
        loadingContacts: false
      })
    } catch (e) {
      alert(`Failed to fetch contacts: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Contacts</Header>

        {this.renderCreateContactInput()}

        {this.renderContacts()}
      </div>
    )
  }

  renderCreateContactInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            fluid
            label="Name"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
          <br/>
          <Input
            fluid
            label="Phone"
            placeholder="To change the world..."
            onChange={this.handlePhoneChange}
          />
          <br/>
          <Button
            icon
            color="green"
            onClick={(e) => this.onContactCreate()}
          >
            <Icon name="add" /> Add new contact
          </Button>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderContacts() {
    if (this.state.loadingContacts) {
      return this.renderLoading()
    }

    return this.renderContactsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Contacts
        </Loader>
      </Grid.Row>
    )
  }

  renderContactsList() {
    return (
      <Card.Group>
        {this.state.contacts.map((contact, pos) => {
          return (
            <Card key={contact.contactId}>
              <Card.Content>
                <Image
                  floated='right'
                  size='medium'
                  src={contact.attachmentUrl}
                />
                <Card.Header>{contact.name}</Card.Header>
                <Card.Meta>{contact.phone}</Card.Meta>
              </Card.Content>
              <Card.Content extra>
                <div className='ui two buttons'>
                  <Button basic color='green' onClick={() => this.onEditButtonClick(contact.contactId)}>
                    Edit
                  </Button>
                  <Button basic color='red' onClick={() => this.onContactDelete(contact.contactId)}>
                    Delete
                  </Button>
                </div>
              </Card.Content>
            </Card>
          )
        })}
      </Card.Group>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
